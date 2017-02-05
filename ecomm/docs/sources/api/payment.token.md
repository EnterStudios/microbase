# payment.token

This method is used to generate tokens to be used in transactions.

# Arguments

This method has the URL https://server/services/payment/v1/payment.token and
follows the [MicroBase API calling conventions](../calling-conventions.html).

Argument | Required | Type | Example | Description
---------|----------|------|---------|------------
gateway  | yes | String  | stripe    | The transactions gateway to use.
params   | yes | String  | see below | Gateway specific data.

## Stripe example

```json
{
	"gateway": "stripe",
	"params": {
		"card":{
		    "number": "4242424242424242",
		    "exp_month":"12",
		    "exp_year":"2018",
		    "cvc":"123"
		}
	}
}
```

# Response

The response is also gateway dependant.

## Stripe example

```json
{
  "ok": true,
  "data" : {
    "id": "tok_...",
    "object": "token",
    "card": {
      "id": "card_...",
      "object": "card",
      "address_city": null,
      "address_country": null,
      "address_line1": null,
      "address_line1_check": null,
      "address_line2": null,
      "address_state": null,
      "address_zip": null,
      "address_zip_check": null,
      "brand": "Visa",
      "country": "US",
      "cvc_check": "unchecked",
      "dynamic_last4": null,
      "exp_month": 12,
      "exp_year": 2018,
      "fingerprint": "Xt5EWLLDS7FJjR1c",
      "funding": "credit",
      "last4": "4242",
      "metadata": {},
      "name": null,
      "tokenization_method": null
    },
    "client_ip": "...",
    "created": 1486053310,
    "livemode": false,
    "type": "card",
    "used": false
  }
}
```

# Errors

Expected errors that this method could return. Some errors return additional data.

Error | Data | Description
------|------|------------
invalid_gateway | The gateway code | The gateway doesn￿'t exist

# Example

```bash
curl --request POST \
  --url http://localhost:3000/services/payment/v1/payment.token \
  --header 'authorization: Bearer xxxxx...' \
  --header 'accept: application/json' \
  --header 'content-type: application/json'
  --data '{...}'
```