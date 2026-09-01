import supabase from "../config/supabase";

const NUMBER_OF_CLAIMS = 20;

const names = [
    "John Doe",
    "Jane Smith",
    "Alice Johnson",
    "Bob Brown",
    "Charlie Davis",
    "Diana Evans",
    "Frank Green",
    "Grace Harris",
    "Henry Jackson",
    "Ivy King" ,
    "Jack Lee",
    "Kathy Miller",
    "Larry Nelson",
    "Mona Owens",
    "Nina Parker",
    "Oscar Quinn",
    "Paula Roberts",
    "Quincy Scott",
    "Rachel Taylor",
    "Sam Underwood",
    "Joel Komieter",
]

async function seedClaims() {
    const claims = [];
    for (let i = 0; i < NUMBER_OF_CLAIMS; i++) {
        const name = names[Math.floor(Math.random() * names.length)];
        const policyNumber = `POL-${Math.floor(Math.random() * 1000000)}`;
        
        // loss_date must be <= date_notified
        const lossDate = new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0];
        const dateNotified = new Date(new Date(lossDate).getTime() + Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
        
        const lossNature = ["Fire", "Flood", "Theft", "Accident"][Math.floor(Math.random() * 4)];
        const currency = ["USD", "EUR", "GBP", "GHS"][Math.floor(Math.random() * 4)];
        const estimatedLossAmount = (Math.random() * 10000).toFixed(2);
        // approved_amount is optional and can be null, but if present, it should be less than or equal to estimated_loss_amount
        const approvedAmount = Math.random() < 0.5 ? null : (Math.random() * parseFloat(estimatedLossAmount)).toFixed(2);
        
        claims.push({
            policy_number: policyNumber,
            insured_name: name,
            loss_date: lossDate,
            date_notified: dateNotified,
            loss_nature: lossNature,
            currency: currency,
            estimated_loss_amount: estimatedLossAmount,
            approved_amount: approvedAmount,
        });
    }

    const { data, error } = await supabase.from("claims").insert(claims).select("id");

    if (error) {
        console.error("Error seeding claims:", error);
    } else {
        console.log(`Successfully seeded ${data.length} claims.`);
    }
}

seedClaims();