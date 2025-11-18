# tests/integration/post-fragments-unsupported-type.hurl

POST http://localhost:8080/v1/fragments
Content-Type: application/unknown
[BasicAuth]
user1@email.com:password1

`abcdefg`

HTTP/1.1 415

[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.code" == 415
