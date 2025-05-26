const Role = require('./../models/Role');

exports.listRoles = async (req, res) => {
  const roles = await Role.findAll();
  res.render('admin/role-list', { roles });
};

exports.showAddRole = (req, res) => {
  res.render('admin/role-add');
};

exports.addRole = async (req, res) => {
  await Role.create({ name: req.body.name });
  res.redirect('/admin');
};

exports.showEditRole = async (req, res) => {
  const role = await Role.findById(req.params.id);
  res.render('admin/role-edit', { role });
};

exports.editRole = async (req, res) => {
  await Role.findByIdAndUpdate(req.params.id, { name: req.body.name });
  res.redirect('/admin');
};

exports.deleteRole = async (req, res) => {
  await Role.findByIdAndDelete(req.params.id);
  res.redirect('/admin');
};
