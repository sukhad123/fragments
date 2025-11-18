POST http://localhost:8080/v1/fragments
Content-Type: text/plain
[BasicAuth]
user1@email.com:password1

`This is a fragment!`

HTTP/1.1 200
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.type" == "text/plain"
jsonpath "$.fragment.size" == 19
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
jsonpath "$.fragment.id" matches "^[0-9a-fA-F-]+$"

[Captures]
url: header "Location"

GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: application/json; charset=utf-8

[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment" == "This is a fragment!"
