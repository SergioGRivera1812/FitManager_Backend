const User = require('../models/User');
const Gimnasio = require('../models/Gimnasio');
const jwt = require('jsonwebtoken');

class AuthService {
  async register({ nombre, email, password, nombreGimnasio, id_gimnasio, rol }) {
    let gymId = id_gimnasio;

    // Si es un nuevo cliente SaaS, creamos el gimnasio primero
    if (!gymId && nombreGimnasio) {
      const gimnasio = await Gimnasio.create({ nombre: nombreGimnasio });
      gymId = gimnasio.id_gimnasio;
    }

    if (!gymId) {
      throw new Error('Se requiere id_gimnasio o nombreGimnasio');
    }

    const user = await User.create({
      nombre,
      email,
      password,
      id_gimnasio: gymId,
      rol: rol || 'admin'
    });

    return user;
  }

  /**
   * Crea un nuevo usuario (recepcionista/staff o admin) para un gimnasio existente.
   * El id_gimnasio proviene del token del admin que realiza la acción.
   */
  async createStaff({ nombre, email, password, id_gimnasio, rol }) {
    // Validamos que el rol sea uno de los permitidos por el modelo
    const rolesPermitidos = ['admin', 'recepcion'];
    const finalRol = rolesPermitidos.includes(rol) ? rol : 'recepcion';

    // Validamos que el email no esté ya registrado en este gimnasio
    const userExists = await User.findOne({ where: { email, id_gimnasio } });
    if (userExists) {
      throw new Error('El email ya está registrado en este gimnasio');
    }

    const user = await User.create({
      nombre,
      email,
      password,
      id_gimnasio,
      rol: finalRol
    });

    return user;
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    
    if (!user || !(await user.matchPassword(password))) {
      throw new Error('Credenciales inválidas');
    }

    return user;
  }

  /**
   * Obtiene la lista de usuarios pertenecientes a un gimnasio específico.
   * Filtra por id_gimnasio y excluye la contraseña de la respuesta.
   */
  async getUsers(id_gimnasio) {
    return await User.findAll({
      where: { id_gimnasio },
      attributes: { exclude: ['password'] }, // Seguridad: no enviar el hash
      order: [['nombre', 'ASC']]
    });
  }

  async getUserById(id_usuario, id_gimnasio) {
    const user = await User.findByPk(id_usuario, {
      include: [{ 
        model: Gimnasio, 
        as: 'gimnasio',
        where: { id_gimnasio }
      }]
    });
    return user;
  }

  generateToken(user) {
    return jwt.sign(
      { 
        id_usuario: user.id_usuario, 
        id_gimnasio: user.id_gimnasio,
        rol: user.rol 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }
}

module.exports = new AuthService();
