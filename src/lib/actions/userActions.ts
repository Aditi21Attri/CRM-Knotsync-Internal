'use server';

import { connectToDatabase } from '@/lib/mongodb';
import type { User, UserRole, UserStatus } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { unassignCustomersByEmployeeId } from './customerActions';
import crypto from 'crypto';

export interface EmployeeData {
  name: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
  avatarUrl?: string;
  password?: string; 
  specializedRegion?: string;
}

interface CreateInitialAdminArgs {
  name: string;
  email: string;
  password?: string; // Password is required for creation
}


export async function getUsers(): Promise<User[]> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    const usersFromDb = await usersCollection.find({}).toArray();
    
    return usersFromDb.map(userDoc => {
      const { _id, password, ...restOfDoc } = userDoc; // Exclude password
      const user: User = {
        id: _id.toString(),
        name: restOfDoc.name,
        email: restOfDoc.email,
        role: restOfDoc.role,
        status: restOfDoc.status || 'active', 
        avatarUrl: restOfDoc.avatarUrl,
        specializedRegion: restOfDoc.specializedRegion,
        resetPasswordToken: restOfDoc.resetPasswordToken,
        resetPasswordExpires: restOfDoc.resetPasswordExpires,
      };
      return user;
    });
  } catch (error) {
    console.error('Failed to fetch users:', error);
    throw new Error('Failed to fetch users.');
  }
}

export async function getEmployees(): Promise<User[]> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    const employeesFromDb = await usersCollection.find({ role: 'employee' }).toArray();

    return employeesFromDb.map(empDoc => {
       const { _id, password, ...restOfDoc } = empDoc; // Exclude password
       const employee: User = {
        id: _id.toString(),
        name: restOfDoc.name,
        email: restOfDoc.email,
        role: restOfDoc.role as 'employee', 
        status: restOfDoc.status || 'active',
        avatarUrl: restOfDoc.avatarUrl,
        specializedRegion: restOfDoc.specializedRegion,
        resetPasswordToken: restOfDoc.resetPasswordToken,
        resetPasswordExpires: restOfDoc.resetPasswordExpires,
      };
      return employee;
    });
  } catch (error) {
    console.error('Failed to fetch employees:', error);
    throw new Error('Failed to fetch employees.');
  }
}

export async function getAllEmployees(): Promise<User[]> {
  const db = await connectToDatabase();
  const usersCollection = db.collection<Omit<User, 'id'>>('users');
  const employees = await usersCollection.find({ role: 'employee' }).toArray();
  return employees.map(emp => ({
    id: emp._id.toString(),
    name: emp.name,
    email: emp.email,
    role: emp.role,
    status: emp.status,
    avatarUrl: emp.avatarUrl,
    specializedRegion: emp.specializedRegion,
  }));
}

export async function addEmployeeAction(employeeData: Required<Pick<EmployeeData, 'name' | 'email' | 'role' | 'password'>> & Partial<Omit<EmployeeData, 'name' | 'email' | 'role' | 'password' | 'status'>>): Promise<User> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');

    const existingUser = await usersCollection.findOne({ email: employeeData.email.toLowerCase() });
    if (existingUser) {
      throw new Error('An employee with this email already exists.');
    }

    const newEmployeeDbData: Omit<User, 'id'> = {
      name: employeeData.name,
      email: employeeData.email.toLowerCase(),
      password: employeeData.password, 
      role: employeeData.role,
      status: 'active', 
      avatarUrl: employeeData.avatarUrl || `https://placehold.co/100x100/E5EAF7/2962FF?text=${employeeData.name.substring(0,2).toUpperCase()}`,
      specializedRegion: employeeData.specializedRegion || undefined,
    };

    const result = await usersCollection.insertOne(newEmployeeDbData);

    if (!result.insertedId) {
      throw new Error('MongoDB insertOne operation completed but did not return an insertedId.');
    }
    
    const insertedDoc = await usersCollection.findOne({ _id: result.insertedId });

    if (!insertedDoc) {
        throw new Error('Failed to retrieve the newly inserted employee from the database using its ID.');
    }
    
    const { _id, password, ...restOfDoc } = insertedDoc; // Exclude password from returned object
    const finalUser: User = {
      id: _id.toString(),
      name: restOfDoc.name,
      email: restOfDoc.email,
      role: restOfDoc.role,
      status: restOfDoc.status,
      avatarUrl: restOfDoc.avatarUrl,
      specializedRegion: restOfDoc.specializedRegion,
    };
    return finalUser;

  } catch (error) {
    console.error('Full error in addEmployeeAction:', error); 
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to add employee. Details: ${errorMessage}`);
  }
}

export async function updateEmployeeAction(employeeId: string, updatedData: Partial<Omit<EmployeeData, 'password' | 'status'>>): Promise<User | null> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    
    const updatePayload: Partial<Omit<User, 'id' | 'password' | 'status'>> = { ...updatedData };
    if (updatedData.email) {
        updatePayload.email = updatedData.email.toLowerCase();
    }
    if (updatedData.name && !updatedData.avatarUrl) { 
        updatePayload.avatarUrl = `https://placehold.co/100x100/E5EAF7/2962FF?text=${updatedData.name.substring(0,2).toUpperCase()}`;
    }
    
    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(employeeId) },
      { $set: updatePayload },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return null; 
    }
    
    const { _id, password, ...restOfUser } = result; // Exclude password
    const updatedUser: User = {
      id: _id.toString(),
      name: restOfUser.name,
      email: restOfUser.email,
      role: restOfUser.role,
      status: restOfUser.status || 'active', 
      avatarUrl: restOfUser.avatarUrl,
      specializedRegion: restOfUser.specializedRegion,
      resetPasswordToken: restOfUser.resetPasswordToken,
      resetPasswordExpires: restOfUser.resetPasswordExpires,
    };
    return updatedUser;

  } catch (error) {
    console.error('Full error in updateEmployeeAction:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to update employee. Details: ${errorMessage}`);
  }
}

export async function deleteEmployeeAction(employeeId: string): Promise<{ success: boolean; message?: string }> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    
    await unassignCustomersByEmployeeId(employeeId);

    const result = await usersCollection.deleteOne({ _id: new ObjectId(employeeId) });

    if (result.deletedCount === 0) {
      return { success: false, message: 'Employee not found.' };
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting employee:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, message: `Failed to delete employee: ${errorMessage}` };
  }
}

export async function toggleEmployeeSuspensionAction(employeeId: string): Promise<User | null> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');

    const employee = await usersCollection.findOne({ _id: new ObjectId(employeeId) });
    if (!employee) {
      return null;
    }

    const newStatus: UserStatus = employee.status === 'active' ? 'suspended' : 'active';

    const result = await usersCollection.findOneAndUpdate(
      { _id: new ObjectId(employeeId) },
      { $set: { status: newStatus } },
      { returnDocument: 'after' }
    );

    if (!result) {
      return null;
    }
    const { _id, password, ...restOfUser } = result; // Exclude password
    return { 
      id: _id.toString(), 
      name: restOfUser.name,
      email: restOfUser.email,
      role: restOfUser.role,
      status: restOfUser.status, 
      avatarUrl: restOfUser.avatarUrl,
      specializedRegion: restOfUser.specializedRegion,
      resetPasswordToken: restOfUser.resetPasswordToken,
      resetPasswordExpires: restOfUser.resetPasswordExpires,
    } as User;
  } catch (error) {
    console.error('Error toggling employee suspension:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to toggle employee suspension: ${errorMessage}`);
  }
}

export async function authenticateUser(email: string, passwordAttempt: string): Promise<User | null> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    
    const userDoc = await usersCollection.findOne({ email: email.toLowerCase() });

    if (userDoc) {
      if (!userDoc.password) {
          console.warn(`User ${email} has no password set in the database.`);
          return null; 
      }

      if (userDoc.status === 'suspended') {
        return null; 
      }

      if (userDoc.password === passwordAttempt) {
        const { _id, password, ...restOfDoc } = userDoc; 
        const user: User = {
          id: _id.toString(),
          name: restOfDoc.name,
          email: restOfDoc.email,
          role: restOfDoc.role,
          status: restOfDoc.status || 'active', 
          avatarUrl: restOfDoc.avatarUrl,
          specializedRegion: restOfDoc.specializedRegion,
          resetPasswordToken: restOfDoc.resetPasswordToken,
          resetPasswordExpires: restOfDoc.resetPasswordExpires,
        };
        return user; 
      }
    }
    return null; 
  } catch (error) {
    console.error('Error during user authentication:', error);
    if (error instanceof Error && error.message.includes('SSL routines')) {
         console.error('An SSL/TLS error occurred during authentication. Check MONGODB_URI and server SSL configuration.');
         throw new Error('Authentication failed due to a network security issue. Please contact support.');
    }
    throw new Error('Authentication failed due to a server error.');
  }
}

export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    const user = await usersCollection.findOne({ email: email.toLowerCase() });

    if (!user) {
      return { success: true, message: "If your email is registered, you will receive a password reset link." };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour from now

    await usersCollection.updateOne(
      { _id: user._id },
      { $set: { resetPasswordToken: resetToken, resetPasswordExpires: resetPasswordExpires } }
    );

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/reset-password/${resetToken}`;
    console.log(`Password Reset Link (for ${email}): ${resetUrl}`); 

    return { success: true, message: "If your email is registered, you will receive a password reset link. (Link logged to server console for prototype)" };
  } catch (error) {
    console.error('Error requesting password reset:', error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, message: `Failed to request password reset: ${errorMessage}` };
  }
}

export async function verifyTokenForPasswordReset(token: string): Promise<{ isValid: boolean; message?: string; email?: string }> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    const user = await usersCollection.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return { isValid: false, message: "Password reset token is invalid or has expired." };
    }

    return { isValid: true, email: user.email };
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return { isValid: false, message: "An error occurred while verifying the token." };
  }
}

export async function resetPassword(token: string, newPasswordValue: string): Promise<{ success: boolean; message: string }> {
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');
    
    const user = await usersCollection.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return { success: false, message: "Password reset token is invalid or has expired." };
    }

    await usersCollection.updateOne(
      { _id: user._id },
      { 
        $set: { password: newPasswordValue }, 
        $unset: { resetPasswordToken: "", resetPasswordExpires: "" } 
      }
    );

    return { success: true, message: "Your password has been successfully reset. Please log in with your new password." };
  } catch (error) {
    console.error('Error resetting password:', error);
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
    return { success: false, message: `Failed to reset password: ${errorMessage}` };
  }
}

export async function createInitialAdminAction(
  { name, email, password: adminPassword }: CreateInitialAdminArgs
): Promise<{ success: boolean; user?: User; message?: string }> {
  if (!adminPassword) {
    return { success: false, message: "Password is required to create an admin." };
  }
  try {
    const db = await connectToDatabase();
    const usersCollection = db.collection<Omit<User, 'id'>>('users');

    // Check if any admin user already exists
    const existingAdmin = await usersCollection.findOne({ role: 'admin' });
    if (existingAdmin) {
      return { success: false, message: 'An admin account already exists. Initial admin can only be created once.' };
    }

    const lowercasedEmail = email.toLowerCase();
    const userWithSameEmail = await usersCollection.findOne({ email: lowercasedEmail });
    if (userWithSameEmail) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    const newAdminDbData: Omit<User, 'id'> = {
      name,
      email: lowercasedEmail,
      password: adminPassword, // Store the plain password (for prototype)
      role: 'admin',
      status: 'active',
      avatarUrl: `https://placehold.co/100x100/2962FF/E5EAF7?text=${name.substring(0, 2).toUpperCase()}`,
    };

    const result = await usersCollection.insertOne(newAdminDbData);
    if (!result.insertedId) {
      throw new Error('MongoDB insertOne operation failed to return an insertedId for initial admin.');
    }

    const insertedDoc = await usersCollection.findOne({ _id: result.insertedId });
    if (!insertedDoc) {
      throw new Error('Failed to retrieve the newly created admin from the database.');
    }
    
    const { _id, password, ...restOfDoc } = insertedDoc; // Exclude password from returned object
    const finalUser: User = {
      id: _id.toString(),
      name: restOfDoc.name,
      email: restOfDoc.email,
      role: restOfDoc.role,
      status: restOfDoc.status,
      avatarUrl: restOfDoc.avatarUrl,
    };

    return { success: true, user: finalUser, message: 'Initial admin account created successfully.' };
  } catch (error) {
    console.error('Error creating initial admin:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, message: `Failed to create initial admin: ${errorMessage}` };
  }
}
