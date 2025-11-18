POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8
[BasicAuth]
user1@email.com:password1

`Hello with charset!`

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.type" == "text/plain"

[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200

[Asserts]
jsonpath "$.fragment" == "Hello with charset!"
