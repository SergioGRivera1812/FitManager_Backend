const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Member = sequelize.define('Member', {
  id_miembro: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  id_gimnasio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'gimnasios',
      key: 'id_gimnasio'
    }
  },
  nombre: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  apellido: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  estado: {
    type: DataTypes.ENUM('activo', 'vencido'),
    defaultValue: 'vencido',
  }
}, {
  tableName: 'miembros',
  timestamps: false,
  createdAt: 'fecha_registro',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  paranoid: false,
});

module.exports = Member;
