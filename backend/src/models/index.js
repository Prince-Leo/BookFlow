const { sequelize } = require('../config/database');
const { DataTypes } = require('sequelize');

// User Model
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  fullName: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING(20)
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'librarian'),
    defaultValue: 'user'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended'),
    defaultValue: 'active'
  },
  maxBooks: {
    type: DataTypes.INTEGER,
    defaultValue: 5
  },
  borrowCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'users',
  timestamps: true
});

// Category Model
const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'categories',
  timestamps: true
});

// Book Model
const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  isbn: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  author: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  publisher: {
    type: DataTypes.STRING(100)
  },
  publishYear: {
    type: DataTypes.INTEGER
  },
  description: {
    type: DataTypes.TEXT
  },
  coverImage: {
    type: DataTypes.STRING(255)
  },
  totalQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  availableQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  location: {
    type: DataTypes.STRING(50)
  },
  status: {
    type: DataTypes.ENUM('available', 'borrowed', 'reserved', 'maintenance'),
    defaultValue: 'available'
  },
  rating: {
    type: DataTypes.DECIMAL(2, 1),
    defaultValue: 0
  },
  ratingCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  categoryId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'categories',
      key: 'id'
    }
  }
}, {
  tableName: 'books',
  timestamps: true
});

// BorrowRecord Model
const BorrowRecord = sequelize.define('BorrowRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  borrowDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  returnDate: {
    type: DataTypes.DATE
  },
  status: {
    type: DataTypes.ENUM('borrowed', 'returned', 'overdue', 'renewed'),
    defaultValue: 'borrowed'
  },
  renewCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  fineAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0
  },
  notes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'borrow_records',
  timestamps: true
});

// Reservation Model
const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  reservationDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expiryDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'fulfilled', 'cancelled', 'expired'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'reservations',
  timestamps: true
});

// Review Model
const Review = sequelize.define('Review', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  comment: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'reviews',
  timestamps: true
});

// Favorite Model
const Favorite = sequelize.define('Favorite', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'favorites',
  timestamps: true
});

// SystemLog Model
const SystemLog = sequelize.define('SystemLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER
  },
  action: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  entityType: {
    type: DataTypes.STRING(50)
  },
  entityId: {
    type: DataTypes.INTEGER
  },
  details: {
    type: DataTypes.JSONB
  },
  ipAddress: {
    type: DataTypes.STRING(45)
  }
}, {
  tableName: 'system_logs',
  timestamps: true
});

// Define Relationships
Book.belongsTo(Category, { foreignKey: 'categoryId' });
Category.hasMany(Book, { foreignKey: 'categoryId' });

BorrowRecord.belongsTo(User, { foreignKey: 'userId' });
BorrowRecord.belongsTo(Book, { foreignKey: 'bookId' });
User.hasMany(BorrowRecord, { foreignKey: 'userId' });
Book.hasMany(BorrowRecord, { foreignKey: 'bookId' });

Reservation.belongsTo(User, { foreignKey: 'userId' });
Reservation.belongsTo(Book, { foreignKey: 'bookId' });
User.hasMany(Reservation, { foreignKey: 'userId' });
Book.hasMany(Reservation, { foreignKey: 'bookId' });

Review.belongsTo(User, { foreignKey: 'userId' });
Review.belongsTo(Book, { foreignKey: 'bookId' });
User.hasMany(Review, { foreignKey: 'userId' });
Book.hasMany(Review, { foreignKey: 'bookId' });

Favorite.belongsTo(User, { foreignKey: 'userId' });
Favorite.belongsTo(Book, { foreignKey: 'bookId' });
User.hasMany(Favorite, { foreignKey: 'userId' });
Book.hasMany(Favorite, { foreignKey: 'bookId' });

module.exports = {
  User,
  Category,
  Book,
  BorrowRecord,
  Reservation,
  Review,
  Favorite,
  SystemLog,
  sequelize
};
