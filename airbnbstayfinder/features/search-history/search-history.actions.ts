"use server"

import { findRecentSearches } from "./search-history.repo"
import { SearchHistory } from "./search-history"

export async function getRecentSearchesAction(): Promise<SearchHistory[]> {
    return findRecentSearches(10)
}
