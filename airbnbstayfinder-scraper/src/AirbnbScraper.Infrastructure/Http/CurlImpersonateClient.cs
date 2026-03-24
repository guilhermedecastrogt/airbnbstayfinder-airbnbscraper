using System.Diagnostics;
using System.Text;
using System.Text.Json;

namespace AirbnbScraper.Infrastructure.Http;

/// <summary>
/// Uses a Python bridge (curl_cffi with impersonate="chrome124") to perform
/// HTTP requests with Chrome-like TLS fingerprints, matching pyairbnb-api behavior.
/// Falls back to regular curl if Python/curl_cffi is not available.
/// </summary>
public sealed class CurlImpersonateClient
{
    private static string? _bridgePath;
    private static bool _bridgeChecked;
    private static readonly object Lock = new();

    private static string? ResolveBridgePath()
    {
        if (_bridgeChecked) return _bridgePath;

        lock (Lock)
        {
            if (_bridgeChecked) return _bridgePath;

            // Look for the bridge script relative to the running assembly
            // AppContext.BaseDirectory is typically bin/Debug/net8.0/
            // scripts/ is at the solution root (5 levels up from bin/Debug/net8.0/)
            var candidates = new[]
            {
                Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "..", "scripts", "curl_bridge.py"),
                Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "scripts", "curl_bridge.py"),
                Path.Combine(AppContext.BaseDirectory, "scripts", "curl_bridge.py"),
                Path.Combine(Directory.GetCurrentDirectory(), "scripts", "curl_bridge.py"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "scripts", "curl_bridge.py"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "scripts", "curl_bridge.py"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "..", "scripts", "curl_bridge.py"),
            };

            foreach (var candidate in candidates)
            {
                var full = Path.GetFullPath(candidate);
                if (File.Exists(full))
                {
                    // Verify python3 + curl_cffi are available
                    try
                    {
                        var psi = new ProcessStartInfo
                        {
                            FileName = "python3",
                            RedirectStandardOutput = true,
                            RedirectStandardError = true,
                            UseShellExecute = false,
                            CreateNoWindow = true
                        };
                        psi.ArgumentList.Add("-c");
                        psi.ArgumentList.Add("from curl_cffi import requests");
                        using var p = Process.Start(psi);
                        p?.WaitForExit(5000);
                        if (p is { ExitCode: 0 })
                        {
                            _bridgePath = full;
                            Console.WriteLine($"[CurlImpersonate] Using Python bridge: {full}");
                            _bridgeChecked = true;
                            return _bridgePath;
                        }
                    }
                    catch
                    {
                    }
                }
            }

            Console.WriteLine("[CurlImpersonate] Python bridge not available, falling back to regular curl");
            _bridgeChecked = true;
            return null;
        }
    }

    public async Task<CurlResponse> GetAsync(string url, Dictionary<string, string>? headers = null, int timeoutSeconds = 60)
    {
        var bridge = ResolveBridgePath();
        if (bridge != null)
            return await ExecuteViaBridgeAsync("GET", url, headers, null, timeoutSeconds);

        return await ExecuteViaCurlAsync("GET", url, headers, null, timeoutSeconds);
    }

    public async Task<CurlResponse> PostAsync(string url, string body, Dictionary<string, string>? headers = null, int timeoutSeconds = 60)
    {
        var bridge = ResolveBridgePath();
        if (bridge != null)
            return await ExecuteViaBridgeAsync("POST", url, headers, body, timeoutSeconds);

        return await ExecuteViaCurlAsync("POST", url, headers, body, timeoutSeconds);
    }

    private static async Task<CurlResponse> ExecuteViaBridgeAsync(
        string method, string url, Dictionary<string, string>? headers, string? body, int timeoutSeconds)
    {
        var input = new Dictionary<string, object?>
        {
            ["method"] = method,
            ["url"] = url,
            ["headers"] = headers,
            ["body"] = body
        };
        var inputJson = JsonSerializer.Serialize(input);

        var psi = new ProcessStartInfo
        {
            FileName = "python3",
            ArgumentList = { ResolveBridgePath()! },
            RedirectStandardInput = true,
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
            StandardOutputEncoding = Encoding.UTF8
        };

        using var process = Process.Start(psi)
            ?? throw new InvalidOperationException("Failed to start python3");

        await process.StandardInput.WriteAsync(inputJson);
        process.StandardInput.Close();

        var stdoutTask = process.StandardOutput.ReadToEndAsync();
        var stderrTask = process.StandardError.ReadToEndAsync();

        var completed = process.WaitForExit(timeoutSeconds * 1000 + 5000);
        if (!completed)
        {
            process.Kill();
            throw new TimeoutException($"Python bridge timed out after {timeoutSeconds}s");
        }

        var stdout = await stdoutTask;
        var stderr = await stderrTask;

        if (process.ExitCode != 0)
            throw new InvalidOperationException($"Python bridge failed: {stderr}");

        using var doc = JsonDocument.Parse(stdout);
        var status = doc.RootElement.GetProperty("status").GetInt32();
        var responseBody = doc.RootElement.GetProperty("body").GetString() ?? "";

        return new CurlResponse(status, responseBody);
    }

    private static async Task<CurlResponse> ExecuteViaCurlAsync(
        string method, string url, Dictionary<string, string>? headers, string? body, int timeoutSeconds)
    {
        var psi = new ProcessStartInfo
        {
            FileName = "curl",
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
            StandardOutputEncoding = Encoding.UTF8
        };

        psi.ArgumentList.Add("-s");
        psi.ArgumentList.Add("-w");
        psi.ArgumentList.Add("\n%{http_code}");
        psi.ArgumentList.Add("--max-time");
        psi.ArgumentList.Add(timeoutSeconds.ToString());
        psi.ArgumentList.Add("--http2");
        psi.ArgumentList.Add("--compressed");
        psi.ArgumentList.Add("-X");
        psi.ArgumentList.Add(method);

        if (headers != null)
        {
            foreach (var (key, value) in headers)
            {
                psi.ArgumentList.Add("-H");
                psi.ArgumentList.Add($"{key}: {value}");
            }
        }

        if (body != null)
        {
            psi.ArgumentList.Add("-d");
            psi.ArgumentList.Add(body);
        }

        psi.ArgumentList.Add(url);

        using var process = Process.Start(psi)
            ?? throw new InvalidOperationException("Failed to start curl");

        var stdout = await process.StandardOutput.ReadToEndAsync();
        var stderr = await process.StandardError.ReadToEndAsync();
        await process.WaitForExitAsync();

        if (process.ExitCode != 0)
            throw new InvalidOperationException($"curl exited with code {process.ExitCode}: {stderr}");

        // Parse status code from the last line
        var lastNewline = stdout.LastIndexOf('\n');
        var statusStr = lastNewline >= 0 ? stdout[(lastNewline + 1)..].Trim() : "200";
        var responseBody = lastNewline >= 0 ? stdout[..lastNewline] : stdout;

        int.TryParse(statusStr, out var statusCode);
        return new CurlResponse(statusCode, responseBody);
    }
}

public record CurlResponse(int StatusCode, string Body)
{
    public bool IsSuccessStatusCode => StatusCode >= 200 && StatusCode < 300;

    public void EnsureSuccessStatusCode()
    {
        if (!IsSuccessStatusCode)
            throw new HttpRequestException($"HTTP {StatusCode}: {Body[..Math.Min(Body.Length, 500)]}");
    }
}
