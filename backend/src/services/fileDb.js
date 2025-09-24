const fs = require('fs').promises;
const { CUSTOMER_FILE, SELLER_FILE, ADMIN_FILE, CARS_FILE } = require('../config');

async function readJson(file) {
  try {
    const content = await fs.readFile(file, 'utf8');
    return JSON.parse(content || '[]');
  } catch (e) {
    if (e.code === 'ENOENT') return [];
    throw e;
  }
}

async function writeJson(file, data) {
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf8');
}

// Users
async function readAllUsers() {
  const [customers, sellers, admins] = await Promise.all([
    readJson(CUSTOMER_FILE),
    readJson(SELLER_FILE),
    readJson(ADMIN_FILE),
  ]);
  return [...customers, ...sellers, ...admins];
}

async function readCustomers() { return readJson(CUSTOMER_FILE); }
async function writeCustomers(data) { return writeJson(CUSTOMER_FILE, data); }

async function readSellers() { return readJson(SELLER_FILE); }
async function writeSellers(data) { return writeJson(SELLER_FILE, data); }

async function readAdmins() { return readJson(ADMIN_FILE); }
async function writeAdmins(data) { return writeJson(ADMIN_FILE, data); }

// Cars
async function readCars() { return readJson(CARS_FILE); }
async function writeCars(data) { return writeJson(CARS_FILE, data); }

module.exports = {
  readAllUsers,
  readCustomers,
  writeCustomers,
  readSellers,
  writeSellers,
  readAdmins,
  writeAdmins,
  readCars,
  writeCars,
};