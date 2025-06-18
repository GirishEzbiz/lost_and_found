import { getAdminDetail } from "lib/getAdminDetail";

const GetPermission = (permissionToCheck) => {
  const data = getAdminDetail();

  let permissions = [];
  try {
    permissions = JSON.parse(data?.permissions || "[]");
  } catch (err) {
    console.error("Permission parsing error:", err);
  }
  return permissions.includes(permissionToCheck);
};

export default GetPermission;
