import {
    generateFundingSource,
    CREATE_ORDER_URL,
    CAPTURE_ORDER_URL,
} from "../utils";

import type { Args } from "@storybook/addons/dist/ts3.9/types";

const IMPORT_STATEMENT = `import { useEffect } from "react";
import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";`;

const getPayPalScripProvider = (currency: string) =>
    `<PayPalScriptProvider
                options={{
                    "clientId": "test",
                    components: "buttons",
                    currency: "${currency}"
                }}
            >`;

const buttonWrapperEffect = (
    dependencies: string
) => `// usePayPalScriptReducer can be use only inside children of PayPalScriptProviders
    // This is the main reason to wrap the PayPalButtons in a new component
    const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

    useEffect(() => {
        dispatch({
            type: "resetOptions",
            value: {
                ...options,
                currency: currency,
            },
        });
    }, [${dependencies}]);
`;

export const getDefaultCode = (args: Args): string =>
    `${IMPORT_STATEMENT}

// This values are the props in the UI
const amount = "${args.amount}";
const currency = "${args.currency}";
const style = ${JSON.stringify(args.style)};

function createOrder() {
    // replace this url with your server
    return fetch("${CREATE_ORDER_URL}", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        // use the "body" param to optionally pass additional order information
        // like product ids and quantities
        body: JSON.stringify({
            cart: [
                {
                    sku: "1blwyeo8",
                    quantity: 2,
                },
            ],
        }),
    })
        .then((response) => response.json())
        .then((order) => {
            // Your code here after create the order
            return order.id;
        });
}
function onApprove(data) {
    // replace this url with your server
    return fetch("${CAPTURE_ORDER_URL}", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            orderID: data.orderID,
        }),
    })
        .then((response) => response.json())
        .then((orderData) => {
            // Your code here after capture the order
        });
}

// Custom component to wrap the PayPalButtons and handle currency changes
const ButtonWrapper = ({ currency, showSpinner }) => {
    ${buttonWrapperEffect("currency, showSpinner")}

    return (<>
            { (showSpinner && isPending) && <div className="spinner" /> }
            <PayPalButtons
                style={style}
                disabled={${args.disabled}}
                forceReRender={[amount, currency, style]}
                ${generateFundingSource(args.fundingSource as string)}
                createOrder={createOrder}
                onApprove={onApprove}
            />
        </>
    );
}

export default function App() {
	return (
		<div style={{ maxWidth: "${args.size}px", minHeight: "200px" }}>
            ${getPayPalScripProvider(args.currency)}
				<ButtonWrapper
                    currency={currency}
                    showSpinner={${args.showSpinner}}
                />
			</PayPalScriptProvider>
		</div>
	);
}`;

export const getDonateCode = (args: Args): string =>
    `${IMPORT_STATEMENT}

const ButtonWrapper = ({ currency }) => {
    ${buttonWrapperEffect("currency")}

     return (<PayPalButtons
        fundingSource="paypal"
        style={${JSON.stringify({
            ...(args.style as Record<string, unknown>),
            label: "donate",
        })}}
        disabled={${args.disabled}}
        createOrder={(data, actions) => {
            return actions.order
                .create({
                    purchase_units: [
                        {
                            amount: {
                                value: "${args.amount}",
                                breakdown: {
                                    item_total: {
                                        currency_code: "${args.currency}",
                                        value: "${args.amount}",
                                    },
                                },
                            },
                            items: [
                                {
                                    name: "donation-example",
                                    quantity: "1",
                                    unit_amount: {
                                        currency_code: "${args.currency}",
                                        value: "${args.amount}",
                                    },
                                    category: "DONATION",
                                },
                            ],
                        },
                    ],
                })
                .then((orderId) => {
                    // Your code here after create the donation
                    return orderId;
                });
        }}
    />
     );
}

 export default function App() {
     return (
        <div
             style={{ maxWidth: "750px", minHeight: "200px" }}
        >
            ${getPayPalScripProvider(args.currency)}
                <ButtonWrapper
                    currency={"${args.currency}"}
                />
            </PayPalScriptProvider>
        </div>
    );
 }`;
