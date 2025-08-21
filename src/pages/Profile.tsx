import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, collection, getDocs, writeBatch } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Edit, Save, Plus } from 'lucide-react';

// --- Data Structures ---
interface UserProfile {
  displayName: string;
  bio: string;
  wishlist: string[];
  ownedItems: string[];
}

// --- Predefined Item List for Seeding ---
const PREDEFINED_ITEMS = [
  { id: 'laptop', name: 'Laptop' },
  { id: 'smartphone', name: 'Smartphone' },
  { id: 'headphones', name: 'Headphones' },
  { id: 'coffee-maker', name: 'Coffee Maker' },
  { id: 'backpack', name: 'Backpack' },
  { id: 'desk-chair', name: 'Desk Chair' },
  { id: 'mechanical-keyboard', name: 'Mechanical Keyboard' },
  { id: 'monitor', name: '4K Monitor' },
  { id: 'mouse', name: 'Wireless Mouse' },
  { id: 'webcam', name: 'HD Webcam' },
];

const Profile: React.FC = () => {
  // --- State Management ---
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [validItemNames, setValidItemNames] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Edit State
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioContent, setBioContent] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [usernameContent, setUsernameContent] = useState('');

  // Add Item State - Fixed to handle separate inputs
  const [newItemContents, setNewItemContents] = useState({ wishlist: '', ownedItems: '' });

  // --- Data Fetching and Seeding ---
  useEffect(() => {
    const fetchAllData = async () => {
      if (!currentUser) return;
      setLoading(true);
      try {
        const itemsCollectionRef = collection(db, 'items');
        const itemSnapshot = await getDocs(itemsCollectionRef);
        if (itemSnapshot.empty) {
          setError('Master item list not found. Please seed the database.');
        } else {
          const itemNames = itemSnapshot.docs.map(doc => doc.data().name.toLowerCase());
          setValidItemNames(new Set(itemNames));
        }

        const profileDocRef = doc(db, 'users', currentUser.uid);
        const profileDocSnap = await getDoc(profileDocRef);
        if (profileDocSnap.exists()) {
          const data = profileDocSnap.data() as UserProfile;
          setProfile(data);
          setBioContent(data.bio);
          setUsernameContent(data.displayName || currentUser.displayName || '');
        } else {
          const defaultProfile: UserProfile = { 
            displayName: currentUser.displayName || 'Anonymous',
            bio: 'This is your bio. Click edit to change it.', 
            wishlist: [], 
            ownedItems: [] 
          };
          await setDoc(profileDocRef, defaultProfile);
          setProfile(defaultProfile);
          setBioContent(defaultProfile.bio);
          setUsernameContent(defaultProfile.displayName);
        }
      } catch (err) {
        setError('Failed to load profile data.');
        console.error(err);
      }
      setLoading(false);
    };

    fetchAllData();
  }, [currentUser]);

  const handleSeedDatabase = async () => {
    const batch = writeBatch(db);
    PREDEFINED_ITEMS.forEach(item => {
      const docRef = doc(db, 'items', item.id);
      batch.set(docRef, { name: item.name });
    });
    await batch.commit();
    const itemNames = PREDEFINED_ITEMS.map(item => item.name.toLowerCase());
    setValidItemNames(new Set(itemNames));
    setError('');
  };

  // --- Event Handlers ---
  const handleSaveUsername = async () => {
    if (!currentUser || !usernameContent.trim()) return;
    try {
      await updateProfile(currentUser, { displayName: usernameContent.trim() });
      const docRef = doc(db, 'users', currentUser.uid);
      await setDoc(docRef, { displayName: usernameContent.trim() }, { merge: true });
      if (profile) {
        setProfile({ ...profile, displayName: usernameContent.trim() });
      }
      alert('Username updated! Note: Existing posts/comments will not reflect this change.');
    } catch (error) {
      console.error('Error updating username:', error);
      alert('Failed to update username.');
    }
    setIsEditingUsername(false);
  };

  const handleSaveBio = async () => {
    if (!currentUser || !profile) return;
    const docRef = doc(db, 'users', currentUser.uid);
    await setDoc(docRef, { bio: bioContent }, { merge: true });
    setProfile({ ...profile, bio: bioContent });
    setIsEditingBio(false);
  };

  const handleAddItem = async (e: React.FormEvent, listKey: keyof Pick<UserProfile, 'wishlist' | 'ownedItems'>) => {
    e.preventDefault();
    const content = newItemContents[listKey].trim();
    if (!currentUser || !profile || !content) return;

    if (!validItemNames.has(content.toLowerCase())) {
      alert(`'${content}' is not a valid item.`);
      return;
    }

    const currentList = profile[listKey];
    if (currentList.map(item => item.toLowerCase()).includes(content.toLowerCase())) {
      alert(`'${content}' is already in this list.`);
      return;
    }

    const updatedList = [...currentList, content];
    const updatedProfile = { ...profile, [listKey]: updatedList };

    const docRef = doc(db, 'users', currentUser.uid);
    await setDoc(docRef, updatedProfile, { merge: true });
    setProfile(updatedProfile);
    setNewItemContents({ ...newItemContents, [listKey]: '' }); // Clear only the relevant input
  };

  // --- Render Logic ---
  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  if (error && validItemNames.size === 0) {
    return (
      <div className="text-center bg-white p-8 rounded-lg shadow-sm">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={handleSeedDatabase} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Initialize Master Item List
        </button>
      </div>
    );
  }
  
  if (!currentUser || !profile) {
    return <p>Could not load profile.</p>;
  }

  const renderList = (title: string, items: string[], listKey: keyof Pick<UserProfile, 'wishlist' | 'ownedItems'>) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">{item}</li>
        ))}
        {items.length === 0 && <p className="text-sm text-gray-500 italic">No items yet.</p>}
      </ul>
      <form onSubmit={(e) => handleAddItem(e, listKey)} className="mt-4 flex space-x-2">
        <input 
          type="text" 
          placeholder="Add a new item..."
          className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          value={newItemContents[listKey]}
          onChange={(e) => setNewItemContents({ ...newItemContents, [listKey]: e.target.value })}
        />
        <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50" disabled={!newItemContents[listKey].trim()}>
          <Plus className="h-4 w-4" />
        </button>
      </form>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* User Info & Bio */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            {isEditingUsername ? (
              <div className="flex items-center space-x-2">
                <input 
                  type="text"
                  value={usernameContent}
                  onChange={(e) => setUsernameContent(e.target.value)}
                  className="p-2 border border-gray-300 rounded-lg text-xl font-bold"
                />
                <button onClick={handleSaveUsername} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors">
                  <Save className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
                <button onClick={() => setIsEditingUsername(true)} className="p-1 text-gray-500 hover:text-gray-700">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500 mt-1">{currentUser.email}</p>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-gray-800 mb-2">Bio</h4>
          {isEditingBio ? (
            <div>
              <textarea 
                value={bioContent}
                onChange={(e) => setBioContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                rows={3}
              />
              <button onClick={handleSaveBio} className="mt-2 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                <Save className="mr-2 h-4 w-4" /> Save Bio
              </button>
            </div>
          ) : (
            <div className="flex items-start justify-between">
              <p className="text-gray-700 text-sm whitespace-pre-wrap">{profile.bio}</p>
              <button onClick={() => setIsEditingBio(true)} className="p-1 text-gray-500 hover:text-gray-700">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Lists */}
      <div className="grid md:grid-cols-2 gap-8">
        {renderList('Wish List', profile.wishlist, 'wishlist')}
        {renderList('Owned Items', profile.ownedItems, 'ownedItems')}
      </div>
    </div>
  );
};

export default Profile;