import Stripe from "stripe";
const stripe = new Stripe(process.env.Stripe_Private_Key);

export const checkoutPayment = async (req, res) => {
  try {
    // Destructure cartItems and cartTotal from req.body
    const { cartItems, cartTotal } = req.body;

    // Create line items for Stripe
    const lineItems = [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Total Cart Amount", // General name for the entire cart
            },
            unit_amount: Math.round(cartTotal * 100), // Stripe expects amount in paisa
          },
          quantity: 1, // Since it's a single line item for the total amount
        },
      ];

    // Create the checkout session with the provided total amount
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,  
      mode: "payment",
      success_url: `${process.env.CLIENT_DOMAIN}/user/payment/success`,
      cancel_url: `${process.env.CLIENT_DOMAIN}/user/payment/cancel`,
      line_items: lineItems, // Use the total sent from the frontend (don't recalculate)
    });
    
    console.log("sesstionId ====" ,session.id);
    
    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
};

export const sessionStatus = async (req,res) => {
    try {
        const sessionId = req.query.session_id
        const session = await stripe.checkout.sessions.retrieve(sessionId)
        res.send({
            status:session?.status,
            customer_email: session?.customer_details?.email
        })
    } catch (error) {
        res
      .status(error.status || 500)
      .json({ message: error.message || "Internal server error" });
  }
    }
