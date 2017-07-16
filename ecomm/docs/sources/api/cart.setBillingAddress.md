# cart.setBillingAddress

This method is used to assign a billing address to a Cart.

# Arguments

This method has the URL https://server/services/cart/v1/cart.setBillingAddress and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
cartId         | yes | String  | H19PRsec   | The Cart id to assign the address.
billingAddress | no  | Object or String  | - | The billing addresses or the string 'SAMEASSHIPPING'.

## billingAddress

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
firstName    | yes  | String  | John                | Customer first name.
lastName     | no   | String  | Doe                 | Customer last name.
address_1    | yes  | String  | 1650 Bolman Court   | Address information.
address_2    | no   | Array   | Number 10           | Aditional address information.
postCode     | yes  | Number  | 61701               | Address post code
city         | yes  | String  | Bloomington         | Address city
state        | yes  | String  | Illinois            | Address state
country      | yes  | String  | US                  | Address country
company      | no   | String  | My Company          | Name of the company
phone        | no   | Number  | 2173203531          | Address phone
instructions | no   | String  | Some instructions   | Aditional instrucctions for the address

# Response

Returns the modified Cart:

```json
{
    "ok": true,
    "cart": {
        "id": "H19PRsec",
        "customerId": "ANON",
        "expirationTime": "2016-08-23T15:16:50.407Z",
        "tax": 0,
        "beforeTax": 0,
        "items": [],
        "BillingAddress": {
          "firstName": "John",
          "lastName": "Doe",
          "address_1": "1650 Bolman Court",
          "postCode": "61701",
          "city": "Valencia",
          "state": "Piemonte",
          "country": "IT",
          "company": "Thinkwrap",
          "phone": 2173203531,
          "instructions": "Instructions"        
        }
    }
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
validation_error | The data causing the error | Some validation error
cart_not_found   | The cart Id | The cart was not found
invalid_country  | The country code | The country code is invalid 
invalid_state    | The currency code | The state is invalid for the country 
shipping_address_not_set | - | sameAsShipping supplied, but there is no shipping address in this cart

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/cart/v1/cart.setBillingAddress \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json' \
  --data '{...}'
```
