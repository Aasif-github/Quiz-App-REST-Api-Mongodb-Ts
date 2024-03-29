## QUIZ APP

[Registration](http://localhost:3002/auth)

Method: POST 

Request url: http://localhost:3002/auth

Request Body: json
```json
 {
     "name":"asif",
     "email":"aasif.githu@gmail.com",
     "password":"Aasif@999",
     "confirmPassword":"Aasif@999"
 }
```
Status code: 201 Created

Response

```json
{
    "status": "success",
    "message": "OTP has sent on your email. Please Verify",
    "data": {
        "email": "aasif.githu@gmail.com",
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFhc2lmLmdpdGh1QGdtYWlsLmNvbSIsImlhdCI6MTcxMTY5MjI2MX0.-Zx4Rsvtxa1AXw7AET4xsc790YwbItJ8JbvHpcsO0K0"
    }
}
```
### Password varification

Response body: Json
```json
 {
     "name":"Shahid",
     "email":"shahid.githu@gmail.com",
     "password":"12345",
     "confirmPassword":"12345"
 }
```
Status code: 422 Unprocessable Entity
```json
{
    "status": "error",
    "message": "Validation failed!",
    "data": [
        {
            "type": "field",
            "value": "12345",
            "msg": "Invalid value",
            "path": "password",
            "location": "body"
        },
        {
            "type": "field",
            "value": "12345",
            "msg": "Enter a valid password, having atleast 8 characters including 1 small alphabet, 1 capital albhabet, 1 digit and 1 special character($,@,!,#,*).",
            "path": "password",
            "location": "body"
        }
    ]
}

```
Correct password:
Aa@12345

Token:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InNoYWhpZC5naXRodUBnbWFpbC5jb20iLCJpYXQiOjE3MTE2OTM5NTd9.HcMEUfxK12cf3_aq7utB1cFUr2ettTLME5lTL6KQ-Ek

#

[Login](http://localhost:3002/auth/login)

Request URL:http://localhost:3002/auth/login

Method: POST

Request body: Json
```json
{
    "email":"aasif.github@gmail.com",
    "password":"Aasif@999"
}
```
status code: 401 Unauthorized

Response:
```json
{
    "status": "error",
    "message": "Account is not Verified. Please verify your account",
    "data": {}
}
```