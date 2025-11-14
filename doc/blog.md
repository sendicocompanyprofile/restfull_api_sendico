# Blog API Spec

## Create Blog
Endpoint : POST /api/blogs

Request Header :
- X-API-TOKEN   : token

Request Body :
```json
{
    "tittle"        : "Posting 1",
    "description"   : "ini deskripsi Posting 1",
    "date"          : "12 November 2025",
    "Picture"       : "dacaxxacxa.jpg",
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
            "Picture"       : "dacaxxacxa.jpg",
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

## Get Blog
Endpoint : GET /api/blogs

Response Body (Success):
```json
{
    "data" : [
        {
            "id"            : "dacx5ac5a1c5a",
            "tittle"        : "Posting 1",
            "description"   : "ini deskripsi Posting 1",
            "date"          : "12 November 2025",
            "Picture"       : "dacaxxacxa.jpg",
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

## Update Blog
Endpoint : PATCH /api/blogs

Request Header :
- X-API-TOKEN   : token

Request Body :
```json
{
    "tittle"        : "Posting 1",
    "description"   : "ini deskripsi Posting 1",
    "date"          : "12 November 2025",
    "Picture"       : "dacaxxacxa.jpg",
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
            "Picture"       : "dacaxxacxa.jpg",
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

## Remove Blog
Endpoint : DELETE /api/blogs

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

## Search Blog
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
            "tittle"        : "Posting 1",
            "description"   : "ini deskripsi Posting 1",
            "date"          : "12 November 2025",
            "Picture"       : "dacaxxacxa.jpg",
            "create_at"     : "161-45165-",
            "update_at"     : "546-CSjanc",     
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