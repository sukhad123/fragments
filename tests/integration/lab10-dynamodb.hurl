#Post a new Json Fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json; charset=utf-8
[BasicAuth]
user1@email.com:password1
{
  "service": "DynamoDB"
}
HTTP 200
[Captures]
fragment1_id: jsonpath "$.fragment.id"

#POST a second Markdown fragment
POST http://localhost:8080/v1/fragments
Content-Type: application/json; charset=utf-8
[BasicAuth]
user1@email.com:password1
{
  "service": "DynamoDB is great"
}
HTTP 200
[Captures]
fragment2_id: jsonpath "$.fragment.id"

#GET all the fragments that just being created
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200

[Asserts]
jsonpath "$.Fragments" contains {{fragment1_id}}
jsonpath "$.Fragments" contains {{fragment2_id}}

#Delete the fragment
DELETE http://localhost:8080/v1/fragments/{{fragment1_id}}
[BasicAuth]
user1@email.com:password1
HTTP 200

#Convert markdown -> HTML
GET http://localhost:8080/v1/fragments/{{fragment2_id}.html}
[BasicAuth]
user1@email.com:password1
HTTP 200
  header "Content-Type" == "text/html"


#Delete the fragment
DELETE http://localhost:8080/v1/fragments/{{fragment2_id}}
[BasicAuth]
user1@email.com:password1
HTTP 200



#Confirmation
#Delete the fragment
DELETE http://localhost:8080/v1/{{fragment1_id}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 404

#Delete the fragment
DELETE http://localhost:8080/v1/{{fragment2_id}}
[BasicAuth]
user1@email.com:password1
HTTP/1.1 404



# GET all fragments for the same user 
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1
HTTP/1.1 200

[Asserts]
# The first fragment should NOT be present
jsonpath "$.Fragments" not contains {{fragment1_id}}
# The second fragment should not be present
jsonpath "$.Fragments" not contains {{fragment2_id}}
