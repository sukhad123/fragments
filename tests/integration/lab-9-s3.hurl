# 1. POST a new text fragment
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1
`Hello S3!`
HTTP/1.1 200

[Asserts]
header "Location" exists

[Captures]
url: header "Location"

# 2. GET the fragment using the captured URL
GET {{url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200

[Asserts]
header "Content-Type" == "application/json; charset=utf-8"
jsonpath "$.status" == "ok"
jsonpath "$.fragment" == "Hello S3!"

 

# 4. GET again to confirm deletion
GET {{url}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200
