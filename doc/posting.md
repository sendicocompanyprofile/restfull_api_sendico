# Posting API Spec

## Create Posting
Endpoint : POST /api/posting

Request Header :
- X-API-TOKEN   : token

Request Body :
```json
{
    "tittle"        : "Posting 1",
    "description"   : "ini deskripsi Posting 1",
    "date"          : "12 November 2025",
    "Pictures"       : [
        1 : "dacaxxacxa.jpg",
        2 : "dacxacxacsa.jpg",
        3 : "dacxacacxa.jpg",
    ]
}
```

Response Body (Success):
```json
{
    "data" : [
        {
            "id"            : "dacx5ac5a1c5a",
            "tittle"        : "Posting 1",
            "description"   : "ini deskripsi Posting 1",
            "date"          : "12 November 2025",
            "Pictures"       : [
                1 : "dacaxxacxa.jpg",
                2 : "dacxacxacsa.jpg",
                3 : "dacxacacxa.jpg",
            ],
            "create_at"     : "161-45165-",
            "update_at"     : "546-CSjanc",   
        }
    ]
}
```

Response Body (Failed):
```json
{
    "errors"    : "data tidak berhasil,...."
}
```

## Get Posting
Endpoint : GET /api/posting/:id

Response Body (Success):
```json
{
    "data" : [
        {  
            "id"            : "dacx5ac5a1c5a",
            "tittle"        : "Posting 1",
            "description"   : "ini deskripsi Posting 1",
            "date"          : "12 November 2025",
            "Pictures"       : [
                1 : "dacaxxacxa.jpg",
                2 : "dacxacxacsa.jpg",
                3 : "dacxacacxa.jpg",
            ],
            "create_at"     : "161-45165",
            "update_at"      : "461-cdaca",   
        }
    ]
}
```

Response Body (Failed):
```json
{
    "errors"    : "data tidak berhasil,...."
}
```

## Update Posting
Endpoint : PATCH /api/posting/:id

Request Header :
- X-API-TOKEN   : token

Request Body :
```json
{
    "tittle"        : "Posting 1",
    "description"   : "ini deskripsi Posting 1",
    "date"          : "12 November 2025",
    "Pictures"       : [
        1 : "dacaxxacxa.jpg",
        2 : "dacxacxacsa.jpg",
        3 : "dacxacacxa.jpg",
    ]
}
```

Response Body (Success):
```json
{
    "data" : [
        {
            "id"            : "dacx5ac5a1c5a",
            "tittle"        : "Posting 1",
            "description"   : "ini deskripsi Posting 1",
            "date"          : "12 November 2025",
            "Pictures"       : [
                1 : "dacaxxacxa.jpg",
                2 : "dacxacxacsa.jpg",
                3 : "dacxacacxa.jpg",
            ],
            "create_at"     : "161-45165-",
            "update_at"     : "451561- sasacs"
        }   
    ]
}
```

Response Body (Failed):
```json
{
    "errors"    : "data tidak berhasil di perbaharui,...."
}
```

## Remove Posting
Endpoint : DELETE /api/posting

Request Header :
- X-API-TOKEN   : token

Response Body (Success):
```json
{
    "data" : "OK"
}
```

Response Body (Failed):
```json
{
    "errors"    : "data tidak berhasil dihapus,...."
}
```

## Search Posting
Endpoint : GET /api/posting

Query PArameter :
- tittle : string

Request Header :
- X-API-TOKEN   : token

Response Body (Success):
```json
{
    "data" : [
        {
            "id"            : "dacx5ac5a1c5a",
            "Tittle"        : "Posting 1",
            "description"   : "ini deskripsi Posting 1",
            "date"          : "12 November 2025",
            "Pictures"       : [
                1 : "dacaxxacxa.jpg",
                2 : "dacxacxacsa.jpg",
                3 : "dacxacacxa.jpg",
            ],
            "create_at"     : "161-45165-",
            "update_at"     : "dcaacac",   
        }
    ],
    "paging" : {
        "current_page"  : 1,
        "total_page"    : 10,
        "size"          : 10,
    }
}
```

Response Body (Failed):
```json
{
    "errors"    : "Unauthorized,...."
}
```

