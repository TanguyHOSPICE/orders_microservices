export const generateRef = async (name): Promise<string> => {
  const today = new Date().toISOString().split('T')[0].replace(/-/g, ''); // Format YYYYMMDD
  const nameToUpperCase = name.toUpperCase(); // Convert name to uppercase
  let counter = 0; // Initialize counter to 0

  // Generate a unique reference
  const ref = `${nameToUpperCase}-${today}-${counter++}`; // Format PAY-YYYYMMDD-XXXX

  // console.log('🧙🏽‍♂️ ~ Utils ~ generateRef ~ paymentRef:', ref); // ! dev tool

  return ref;
};
