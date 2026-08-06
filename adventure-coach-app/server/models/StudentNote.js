module.exports = (sequelize, DataTypes) => {
  const StudentNote = sequelize.define('StudentNote', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    coach_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'coaches',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    student_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'bookings',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    // Coach-private by default - never surfaced to the student themselves.
    visible_to_student: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    tableName: 'student_notes',
    indexes: [
      { fields: ['coach_id'] },
      { fields: ['student_id'] },
      { fields: ['coach_id', 'student_id'] },
    ],
  });

  // Class methods
  StudentNote.findForStudent = function(coachId, studentId) {
    return this.findAll({
      where: { coach_id: coachId, student_id: studentId },
      order: [['created_at', 'DESC']],
    });
  };

  return StudentNote;
};
