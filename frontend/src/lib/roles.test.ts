import { test } from "node:test";
import assert from "node:assert/strict";
import { canManageRole, canSetRole, canDeleteUser } from "./roles.ts";

test("owner can manage admins and users but not the owner", () => {
  assert.equal(canManageRole("owner", "admin"), true);
  assert.equal(canManageRole("owner", "user"), true);
  assert.equal(canManageRole("owner", "owner"), false);
});

test("admin can only manage plain users", () => {
  assert.equal(canManageRole("admin", "user"), true);
  assert.equal(canManageRole("admin", "admin"), false);
  assert.equal(canManageRole("admin", "owner"), false);
});

test("admin can only ever promote a user to admin, never demote", () => {
  assert.equal(canSetRole("admin", "user", "admin"), true);
  assert.equal(canSetRole("admin", "user", "user"), false);
  assert.equal(canSetRole("admin", "admin", "user"), false);
});

test("owner can set either role on a non-owner target", () => {
  assert.equal(canSetRole("owner", "admin", "user"), true);
  assert.equal(canSetRole("owner", "user", "admin"), true);
});

test("no one can delete the owner; admin can't delete other admins", () => {
  assert.equal(canDeleteUser("owner", "admin"), true);
  assert.equal(canDeleteUser("admin", "admin"), false);
  assert.equal(canDeleteUser("admin", "owner"), false);
});
