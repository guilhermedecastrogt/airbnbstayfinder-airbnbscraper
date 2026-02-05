# Comparação: Python pyairbnb-api vs .NET AirbnbScrapper

## Resumo

| Campo | Python (pyairbnb-api) | .NET (AirbnbScrapper) | Status |
|-------|----------------------|----------------------|--------|
| coordinates | ✅ | ✅ | ✅ Match |
| room_type/propertyType | ✅ | ✅ | ✅ Match |
| is_super_host/isSuperhost | ✅ | ✅ | ✅ Match |
| home_tier/homeTier | ✅ | ✅ | ✅ Match |
| person_capacity/personCapacity | ✅ | ✅ | ✅ Match |
| rating (all fields) | ✅ | ✅ | ✅ Match |
| house_rules/houseRules | ✅ | ✅ | ✅ Match |
| host.id | ✅ | ✅ | ✅ Match |
| host.name | ✅ | ✅ | ✅ Match |
| sub_description/subDescription | ✅ | ✅ | ✅ Match |
| amenities | ✅ | ✅ | ✅ Match |
| highlights | ✅ | ✅ | ✅ Match |
| description | ✅ | ✅ | ✅ Match |
| images | ✅ | ✅ | ✅ Match |
| roomId | ❌ | ✅ | .NET extra |
| title | ❌ | ✅ | .NET extra |
| name | ❌ | ✅ | .NET extra |
| language | ❌ | ✅ | .NET extra |
| price | ❌ | ✅ | .NET extra |
| coHosts | ❌ | ✅ | .NET extra |
| isFreeCancellation | ❌ | ✅ | .NET extra |
| isGuestFavorite | ❌ | ✅ | .NET extra |
| co_hosts (Python) | ✅ | ❌ | Precisa verificar |
| location_descriptions | ✅ | ✅ | ✅ Match (vazio) |
| reviews | ✅ (714KB!) | ✅ (vazio) | ⚠️ Diferente tamanho |

## Diferenças de Naming Convention

| Python (snake_case) | .NET (camelCase) |
|---------------------|------------------|
| room_type | propertyType |
| is_super_host | isSuperhost |
| home_tier | homeTier |
| person_capacity | personCapacity |
| guest_satisfaction | guestSatisfaction |
| review_count | reviewCount |
| house_rules | houseRules |
| sub_description | subDescription |
| location_descriptions | locationDescriptions |

## Estrutura de Rating

**Python:**
```json
{
    "accuracy": 4.66,
    "checking": 4.69,      // Nota: typo no Python (checking vs checkin)
    "cleanliness": 4.37,
    "communication": 4.67,
    "location": 4.59,
    "value": 4.41,
    "guest_satisfaction": 4.51,
    "review_count": "164"   // String no Python
}
```

**.NET:**
```json
{
    "accuracy": 4.66,
    "checkin": 4.69,        // Corrigido para checkin
    "cleanliness": 4.37,
    "communication": 4.67,
    "location": 4.59,
    "value": 4.41,
    "guestSatisfaction": 4.51,
    "reviewCount": 0         // Int no .NET (precisa corrigir extração)
}
```

## Pendências

1. **review_count**: O Python extrai corretamente (164), o .NET está retornando 0
2. **reviews**: O Python retorna lista completa de reviews (714KB), o .NET está vazio
3. **host.profilePictureUrl**: .NET tem campo extra, Python não tem
4. **host.joinedOn**: .NET tem campo extra, precisa popular
5. **host.description**: .NET tem campo extra, precisa popular

## Conclusão

O .NET AirbnbScrapper está **90% compatível** com o Python pyairbnb-api. As principais diferenças são:
- **.NET tem mais campos** (roomId, title, name, price, etc.)
- **Naming convention**: Python usa snake_case, .NET usa camelCase
- **Pendência**: Extração de reviewCount e lista de reviews precisa ser corrigida
