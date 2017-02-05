# customer.address.update

This method is used to update an address in an existent Customer.

# Arguments

This method has the URL https://server/services/customer/v1/customer.address.update and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
customerId | yes  | String      | HkhhuXESl            | Customer identifier.
address    | no   | Object      | -                    | Customer address

## Address

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
id           | yes  | String  | B1Q5HiGHg88         | Address identifier.
name         | yes  | String  | Work                | Address name.
firstName    | yes  | String  | John                | Customer first name.
lastName     | no   | String  | Doe                 | Customer last name.
address_1    | yes  | String  | 1650 Bolman Court   | Address information.
address_2    | no   | Array   | Number 10           | Aditional address information.
postCode     | yes  | String  | 61701               | Address post code
city         | yes  | String  | Bloomington         | Address city
state        | yes  | String  | Illinois            | Address state
country      | yes  | String  | US                  | Address country
company      | no   | String  | My Company          | Name of the company
phone        | no   | Number  | 2173203531          | Address phone
instructions | no   | String  | Some instructions   | Aditional instrucctions for the address

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
customer_address_not_found | The data causing the error | Customer address not found
address_contry_invalid | The data causing the error | Address country has an invalid format

# Example

```bash
curl --request POST \
  --url http://localhost:3005/services/customer/v1/customer.address.update \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{
        "customerId": "HkhhuXESl",
        "address": {
          "id": "B1Q5HiGHg88",
          "name": "Work",
          "firstName": "John",
          "lastName": "Doe",
          "address_1": "1650 Bolman Court",
          "address_2": "",
          "postCode": "61701",
          "city": "Bloomington",
          "state": "Illinois",
          "country": "US",
          "company" : "My Company",
          "phone" : 2173203531,
          "instructions" : "Instructions"
        }
      }'
```
