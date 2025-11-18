POST http://localhost:8080/v1/fragments
Content-Type: application/json
[BasicAuth]
user1@email.com:password1

{"msg": "hello", "num": 123}

HTTP/1.1 200
[Asserts]
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.status" == "ok"

[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8

 