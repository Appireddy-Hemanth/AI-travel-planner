async function runTest() {
  const baseUrl = 'http://localhost:5000/api';
  console.log('=== VERIFYING NEW FEATURES ===');

  let token = '';
  const testEmail = `verify_${Date.now()}@gmail.com`;

  // 1. Register User
  console.log(`Registering user: ${testEmail}...`);
  const regRes = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Verification Tester',
      email: testEmail,
      password: 'password123'
    })
  });
  const regData = await regRes.json();
  if (!regRes.ok) {
    throw new Error(`Registration failed: ${JSON.stringify(regData)}`);
  }
  console.log('Registration successful!');
  token = regData.token;

  // 2. Generate Trip Plan (should contain Weather Insights)
  console.log('Generating trip to Rome, Italy with Weather Insights...');
  const tripRes = await fetch(`${baseUrl}/trips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      destination: 'Rome, Italy',
      durationDays: 4,
      budgetTier: 'Medium',
      interests: ['History', 'Culture', 'Food & Cuisine']
    })
  });
  const tripData = await tripRes.json();
  if (!tripRes.ok) {
    throw new Error(`Trip generation failed: ${JSON.stringify(tripData)}`);
  }
  const trip = tripData.data;
  console.log('Trip successfully generated!');
  console.log('Weather Insights:', trip.weatherInsights);
  if (!trip.weatherInsights || !trip.weatherInsights.averageTemp || !trip.weatherInsights.condition) {
    throw new Error('Weather Insights are missing or incomplete!');
  }
  console.log('✅ Weather Insights verified successfully.');

  // 3. Add an Expense
  console.log('Adding expense to trip...');
  const addExpRes = await fetch(`${baseUrl}/trips/${trip._id}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      category: 'Food',
      amount: 45.99,
      description: 'Pasta dinner at local trattoria'
    })
  });
  const addExpData = await addExpRes.json();
  if (!addExpRes.ok) {
    throw new Error(`Failed to add expense: ${JSON.stringify(addExpData)}`);
  }
  const updatedTrip = addExpData.data;
  console.log('Expenses list after add:', updatedTrip.expenses);
  if (!updatedTrip.expenses || updatedTrip.expenses.length === 0) {
    throw new Error('Expense was not added correctly!');
  }
  const expenseId = updatedTrip.expenses[0]._id;
  console.log('✅ Add Expense verified successfully.');

  // 4. Delete the Expense
  console.log(`Deleting expense ID: ${expenseId}...`);
  const delExpRes = await fetch(`${baseUrl}/trips/${trip._id}/expenses/${expenseId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const delExpData = await delExpRes.json();
  if (!delExpRes.ok) {
    throw new Error(`Failed to delete expense: ${JSON.stringify(delExpData)}`);
  }
  const tripAfterDel = delExpData.data;
  console.log('Expenses list after delete:', tripAfterDel.expenses);
  if (tripAfterDel.expenses && tripAfterDel.expenses.some(e => e._id === expenseId)) {
    throw new Error('Expense was not deleted correctly!');
  }
  console.log('✅ Delete Expense verified successfully.');

  // 5. Test Public share link route (GET /share/:id)
  console.log(`Testing public share route for trip ID: ${trip._id}...`);
  const shareRes = await fetch(`${baseUrl}/trips/share/${trip._id}`);
  const shareData = await shareRes.json();
  if (!shareRes.ok) {
    throw new Error(`Failed to fetch public share: ${JSON.stringify(shareData)}`);
  }
  console.log('Public share destination:', shareData.data.destination);
  if (shareData.data.destination !== 'Rome, Italy') {
    throw new Error('Destination does not match public share output!');
  }
  console.log('✅ Public Share link route verified successfully.');

  console.log('=== ALL NEW FEATURES VERIFIED SUCCESSFULLY ===');
}

runTest().catch(err => {
  console.error('❌ Verification test failed:', err);
  process.exit(1);
});
