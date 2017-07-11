# customer.update

This method is used to update a Customer.

# Arguments

This method has the URL https://server/services/customer/v1/customer.update and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
id        | yes  | String      | HkhhuXESl            | Customer identifier.
email     | no   | String      | john.doe@gmail.com   | Customer email.
firstName | no   | String      | John                 | Customer first name.
lastName  | no   | String      | Doe                  | Customer last name.
status    | no   | String      | ACTIVE               | Status of the customer. ACTIVE or INACTIVE.
tags      | no   | Array       | [VIP]                | Tags associated to the customer.

# Response

Returns a customer object:

```javascript
{
    "ok": true,
    "customer": {
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
    }
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
duplicate_key | Index name and data causing the error | Email is unique
validation_error | The data causing the error | Some validation error
customer_not_found | The data causing the error | Customer not found
customer_invalid_email | The data causing the error | Email has an invalid format

# Example

```bash
curl --request POST \
  --url http://localhost:3005/services/customer/v1/customer.update \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{
        "id": "HkhhuXESl",
        "email": "john.doe@gmail.com",
        "firstName": "John",
        "lastName": "Doe",
        "tags": ["VIP"],
        "status": "ACTIVE"
      }'
```
