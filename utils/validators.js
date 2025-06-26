function isValidMobile(mob_num) {
  const mobRegex = /^\+91\d{10}$/;
  return mobRegex.test(mob_num);
}

function isValidPAN(pan_num) {
  if (!pan_num) return false;
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
  return panRegex.test(pan_num.toUpperCase());
}

const isValidManager = async (manager_id, db) => {
  if (!manager_id) return false;
  const result = await db.get(
    `SELECT * FROM managers WHERE manager_id = ? AND is_active = 1`,
    [manager_id]
  );
  return !!result;
};

module.exports = {
  isValidMobile,
  isValidPAN,
  isValidManager,
};
