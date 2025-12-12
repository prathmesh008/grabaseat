const calculatePrice = (event) => {
  let price = event.basePrice;
  
  // 1. Inventory Logic
  const percentSold = (event.soldCount / event.totalCapacity) * 100;
  if (percentSold >= 90) price *= 1.50;      // 90% full -> +50% price
  else if (percentSold >= 75) price *= 1.25; // 75% full -> +25% price
  else if (percentSold >= 50) price *= 1.10; // 50% full -> +10% price

  // 2. Time Logic
  const daysLeft = Math.ceil((new Date(event.date) - new Date()) / (1000 * 60 * 60 * 24));
  if (daysLeft <= 3) price *= 1.20;          // Last 3 days -> +20% price

  // 3. Limits
  return Math.min(Math.max(price, event.minPrice), event.maxPrice);
};

module.exports = { calculatePrice };