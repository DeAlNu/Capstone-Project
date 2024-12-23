const { db } = require('../config/db');
const fs = require('fs');
const path = require('path');

// Mengambil satu user berdasarkan username
exports.getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('username', '==', username).get();

    if (querySnapshot.empty) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        error: {
          details: "The user does not exist in the database.",
        },
      });
    }

    const user = querySnapshot.docs[0].data();
    return res.status(200).json({
      status: 200,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Failed to retrieve user",
      error: {
        details: error.message,
      },
    });
  }
};

// Mengupdate user berdasarkan username
exports.updateUserByUsername = async (req, res) => {
  const { username } = req.params;
  const updates = req.body;

  try {
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('username', '==', username).get();

    if (querySnapshot.empty) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        error: {
          details: "The user does not exist in the database.",
        },
      });
    }

    const userDoc = querySnapshot.docs[0];
    const userRef = usersRef.doc(userDoc.id);
    
    // Jika ada file gambar baru, hapus gambar lama dan simpan yang baru
    if (req.file) {
      // Simpan gambar baru
      const newProfilePicturePath = `uploads/${req.file.filename}`;
      updates.profilePicture = `/${newProfilePicturePath}`;
    }

    updates.updatedAt = new Date().toISOString();

    // Update data di Firestore
    await userRef.update(updates);
    const updatedDoc = await userRef.get();

    return res.status(200).json({
      status: 200,
      message: "User updated successfully",
      data: updatedDoc.data(),
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Failed to update user",
      error: {
        details: error.message,
      },
    });
  }
};

// Menghapus user berdasarkan username
exports.deleteUserByUsername = async (req, res) => {
  const { username } = req.params;

  try {
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('username', '==', username).get();

    if (querySnapshot.empty) {
      return res.status(404).json({
        status: 404,
        message: "User not found",
        error: {
          details: "The user does not exist in the database.",
        },
      });
    }

    const userDoc = querySnapshot.docs[0];
    const userRef = usersRef.doc(userDoc.id);

    // Hapus file gambar jika ada
    const profilePicturePath = path.join(__dirname, '../', userDoc.data().profilePicture);

    if (fs.existsSync(profilePicturePath)) {
      fs.unlinkSync(profilePicturePath);
    }

    // Hapus data di Firestore
    await userRef.delete();

    return res.status(200).json({
      status: 200,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: 500,
      message: "Failed to delete user",
      error: {
        details: error.message,
      },
    });
  }
};

// Mendapatkan informasi user
// exports.getUser = async (req, res) => {
//   const { id } = req.params; // ID yang akan dicari
//   try {
//     // Query untuk mencocokkan field `id` dengan nilai yang diminta
//     const usersRef = db.collection('users');
//     const querySnapshot = await usersRef.where('id', '==', id).get();

//     // Cek apakah dokumen ditemukan
//     if (querySnapshot.empty) {
//       return res.status(404).json({
//         status: 404,
//         message: "User not found",
//         error: {
//           details: "The user not found in database. Try creating an account.",
//         },
//       });
//     }

//     const userDoc = querySnapshot.docs[0];
//     const userData = userDoc.data();

//     return res.status(200).json({
//       status: 200,
//       message: "Receive data successfully",
//       data: userData,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: 500,
//       message: "Failed to fetch user",
//       error: {
//         details: error.message,
//       },
//     });
//   }
// };

// exports.updateUser = async (req, res) => {
//   const { id } = req.params; 
//   const updates = req.body;

//   try {
//     // Query untuk menemukan dokumen berdasarkan `id`
//     const usersRef = db.collection('users');
//     const querySnapshot = await usersRef.where('id', '==', id).get();

//     if (querySnapshot.empty) {
//       return res.status(404).json({
//         status: 404,
//         message: "User not found",
//         error: {
//           details: "The user not found in database. Try creating an account.",
//         },
//       });
//     }

//     // Ambil dokumen pertama (karena hanya satu dokumen yang diharapkan)
//     const userDoc = querySnapshot.docs[0];
//     const userRef = userDoc.ref;

//     // Perbarui dokumen
//     const updatedAt = new Date().toISOString();
//     await userRef.update({ ...updates, updatedAt });

//     const updatedDoc = await userRef.get();

//     return res.status(200).json({
//       status: 200,
//       message: "User updated successfully",
//       data: updatedDoc.data(),
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: 500,
//       message: "Failed to update user",
//       error: {
//         details: error.message,
//       },
//     });
//   }
// };


// // Menghapus user
// exports.deleteUser = async (req, res) => {
//   const { id } = req.params; // ID yang digunakan untuk pencarian

//   try {
//     // Query untuk menemukan dokumen berdasarkan `id`
//     const usersRef = db.collection('users');
//     const querySnapshot = await usersRef.where('id', '==', id).get();

//     // Jika dokumen tidak ditemukan
//     if (querySnapshot.empty) {
//       return res.status(404).json({
//         status: 404,
//         message: "User not found",
//         error: {
//           details: "The user not found in database. Try creating an account.",
//         },
//       });
//     }

//     // Ambil dokumen pertama (karena hanya satu dokumen yang diharapkan)
//     const userDoc = querySnapshot.docs[0];
//     const userRef = userDoc.ref;

//     // Hapus dokumen
//     await userRef.delete();

//     return res.status(200).json({
//       status: 200,
//       message: "User deleted successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       status: 500,
//       message: "Failed to delete user",
//       error: {
//         details: error.message,
//       },
//     });
//   }
// };

