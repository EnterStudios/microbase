# customer.list

This method is used to get a list of customers using filters.

# Arguments

This method has the URL https://server/services/customer/v1/customer.list and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
id                     | no  | String List  | r1h2uQ4rx            | Customer identifier.
email                  | no  | String List  | john.doe@gmail.com   | Customer email.
status                 | no  | String List  | ACTIVE               | Status of the customer. ACTIVE or INACTIVE.
tags                   | no  | String List  | [VIP]                | Tags associated to the customer.

# Response

Returns a customer object:

```javascript
{
    "ok": true,
    "page": {
        "limit": 10,
        "skip": 0
    },
    "data": [{
        "email": "john.doe@gmail.com",
        "firstName": "John",
        "lastName": "Doe",
        "status": "ACTIVE",
        "tags": [
            "VIP"
        ],
        "addresses": [
            {
                "name": "Work",
                "firstName": "John",
                "lastName": "Doe",
                "address_1": "1650 Bolman Court",
                "address_2": "Number 10",
                "postCode": "61701",
                "city": "Bloomington",
                "state": "Illinois",
                "country": "US",
                "company": "My Company",
                "phone": 2173203531,
                "instructions": "Some Instructions",
                "id": "r1h2uQ4rx"
            }
        ],
        "id": "HkhhuXESl"
    ]}
}
```

# Example

```bash
curl --request POST \
  --url http://localhost:3005/services/customer/v1/customer.list \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{
        "id": "HkhhuXESl,HkhhuXES3"
      }'
```
