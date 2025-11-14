#USER API Spec

## Register User
Endpoint : POST /api/users

Requst Body :
```json 
{
    "username"  : "SendicoCC",
    "password"  : "rahasia554",
    "name"      : "Admin"
} 
```

Response Body (Sucsess) :

```json
{
    "data" : {
        "username"  : "SendicoCC",
        "name"      : "Admin"
    }
}
```

Response Body (Failed) :

```json
{
    "errors" : "Username, Name, And Password must not blank" 
}
```

## Login User
Endpoint : POST /api/users/login

Requst Body :
```json 
{
    "username"  : "SendicoCC",
    "password"  : "rahasia554",
} 
```

Response Body (Sucsess) :

```json
{
    "data" : {
        "username"  : "SendicoCC",
        "name"      : "Admin",
        "token"     : "dacxacxacdadd"
    }
}
```

Response Body (Failed) :

```json
{
    "errors" : "Username or Password wrong .... " 
}
```

## Get User
Endpoint : GET /api/users/current

Request Header :
- X-API-TOKEN   : token

Response Body (Sucsess) :

```json
{
    "data" : {
        "username"  : "SendicoCC",
        "name"      : "Admin"
        "token"     ; "dacxacxacdadd"
    }
}
```

Response Body (Failed) :

```json
{
    "errors" : "Unauthorized..." 
}
```

## Update User
Endpoint : PATCH /api/users/current

Requst Body :
```json 
{
    "username"  : "SendicoCC", // Tidak Wajib
    "password"  : "rahasia554", // Tidak Wajib
    "name"      : "Admin" // Tidak Wajib
} 
```

Response Body (Sucsess) :

```json
{
    "data" : {
        "username"  : "SendicoCC",
        "name"      : "Admin"
        "token"     ; "dacxacxacdadd"
    }
}
```

Response Body (Failed) :

```json
{
    "errors" : "Unauthorized..." 
}
```

## Logout User
Endpoint : DELETE /api/users/current

Request Header :
- X-API-TOKEN   : token

Response Body (Sucsess) :

```json
{
    "data" : "Ok"
}
```

Response Body (Failed) :

```json
{
    "errors" : "Unauthorized..." 
}
```