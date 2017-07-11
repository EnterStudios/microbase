# customer.info

This method is used to get the information of a customer.

# Arguments

This method has the URL https://server/services/customer/v1/customer.info and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
id        | yes  | String      | HkhhuXESl            | Customer identifier.

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
validation_error | The data causing the error | Some validation error
customer_not_found | The data causing the error | Customer not found

# Example

```bash
curl --request POST \
  --url http://localhost:3005/services/customer/v1/customer.info \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{
        "id": "HkhhuXESl"
      }'
```
