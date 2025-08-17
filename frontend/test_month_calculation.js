// Test month calculation logic
// Run this in your browser console

function getCurrentMonthYear() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function getCurrentMonthYearAlternative() {
  const now = new Date();
  return now.toISOString().slice(0, 7); // YYYY-MM format
}

// Test both methods
console.log('Current date:', new Date().toISOString());
console.log('Method 1 (original):', getCurrentMonthYear());
console.log('Method 2 (alternative):', getCurrentMonthYearAlternative());

// Check what month we're actually in
const now = new Date();
console.log('Current year:', now.getFullYear());
console.log('Current month (0-11):', now.getMonth());
console.log('Current month (1-12):', now.getMonth() + 1);
console.log('Current month padded:', String(now.getMonth() + 1).padStart(2, '0'));

// Test with specific dates
const testDates = [
  new Date('2025-01-15'), // January
  new Date('2025-08-15'), // August
  new Date('2025-12-15'), // December
];

testDates.forEach(date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const result = `${year}-${month}`;
  console.log(`${date.toDateString()}: ${result}`);
});
