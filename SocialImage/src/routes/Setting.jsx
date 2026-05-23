import React, { useState } from 'react';
import { useAuth0 } from "@auth0/auth0-react";
import { 
  User, Settings, Lock, Bell, Shield, Sparkles, 
  CheckCircle, AlertTriangle, Eye, EyeOff, LogOut, ChevronRight
} from "lucide-react";

const Setting = () => {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();
  
  // Settings Tab State
  const [activeTab, setActiveTab] = useState("profile");
  
  // Interactive Local States for Preferences
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [profilePrivate, setProfilePrivate] = useState(false);
  const [imageQuality, setImageQuality] = useState("high");
  
  // Profile edit states
  const [displayName, setDisplayName] = useState(user?.name || "John Doe");
  const [bio, setBio] = useState("Exploring the world through a lens and sharing moments. ✨");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditingProfile(false);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 3000);
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "privacy", label: "Privacy & Security", icon: Shield },
    { id: "about", label: "About", icon: Sparkles },
  ];

  const ToggleSwitch = ({ checked, onChange }) => (
    <button 
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-slate-900' : 'bg-slate-200'
      }`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${
        checked ? 'translate-x-4.5' : 'translate-x-1'
      }`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* Toast Notification */}
      {showSavedToast && (
        <div className="fixed bottom-10 right-6 z-50 flex items-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-lg border border-slate-800 text-sm font-medium animate-fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Changes saved successfully</span>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px]">
          <div className="w-full max-w-md bg-white rounded-xl p-6 shadow-xl border border-slate-200">
            <div className="flex items-center gap-2 text-rose-600 mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-bold">Delete Account</h3>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              This action is permanent and cannot be undone. All your posts, likes, followers, and comments will be permanently erased.
            </p>
            <div className="flex gap-2 justify-end">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-md transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  alert("Account deletion initiated (Demo)");
                  setShowDeleteModal(false);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-md shadow-sm transition"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Container */}
      <div className="max-w-4xl mx-auto pt-12 px-4">
        
        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-5">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
          <p className="text-xs text-slate-400 mt-1">Manage your account preferences, configure profile bio, and check privacy standards.</p>
        </div>

        {!isAuthenticated ? (
          /* Minimal Login Card */
          <div className="max-w-md mx-auto text-center bg-white rounded-xl p-8 shadow-sm border border-slate-200/60 mt-12">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 border border-slate-150">
              <Lock className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-1">Authentication Required</h2>
            <p className="text-slate-400 text-xs leading-relaxed mb-6">
              Please sign in securely using Auth0 to customize your application configurations and personal details.
            </p>
            <button
              onClick={() => loginWithRedirect()}
              className="w-full py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition duration-200"
            >
              Sign In to SocialImage
            </button>
          </div>
        ) : (
          /* Settings Content Wrapper */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Minimal Sidebar navigation */}
            <div className="md:col-span-4 space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-4">
                
                {/* User card in sidebar */}
                <div className="flex items-center gap-3 pb-3 border-b border-slate-100 mb-3">
                  <img 
                    src={user?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop"} 
                    alt="avatar" 
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-xs truncate">{user?.name || displayName}</p>
                    <p className="text-slate-400 text-[10px] truncate font-medium">{user?.email || "Authenticated"}</p>
                  </div>
                </div>

                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left text-xs transition duration-150 ${
                          activeTab === tab.id
                            ? "bg-slate-100 text-slate-900 font-bold"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-slate-800' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Log out Button in sidebar */}
              <button
                onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
                className="flex items-center justify-center gap-2 w-full py-2 bg-white text-slate-600 hover:bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-semibold shadow-sm transition duration-150"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-400" />
                Sign Out
              </button>
            </div>

            {/* Right Pane minimal content */}
            <div className="md:col-span-8 bg-white rounded-xl shadow-sm border border-slate-200/60 p-6 min-h-[400px]">
              
              {/* Profile settings tab */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Profile</h2>
                    <p className="text-xs text-slate-400">Configure your public presentation identity details.</p>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <img 
                        src={user?.picture || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop"} 
                        alt="avatar" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800">Avatar Image</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Synced from Auth0 identity records.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Display Username</label>
                        <input 
                          type="text" 
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          disabled={!isEditingProfile}
                          className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-60 transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Account Email Address</label>
                        <input 
                          type="email" 
                          value={user?.email || "user@socialimage.com"}
                          disabled
                          className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-slate-400 text-xs font-medium cursor-not-allowed focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal Biography</label>
                      <textarea 
                        rows="3"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        disabled={!isEditingProfile}
                        placeholder="Tell people about yourself..."
                        className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-slate-400 disabled:opacity-60 transition"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                      {!isEditingProfile ? (
                        <button
                          type="button"
                          onClick={() => setIsEditingProfile(true)}
                          className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
                        >
                          Edit Profile
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setDisplayName(user?.name || "John Doe");
                              setBio("Exploring the world through a lens and sharing moments. ✨");
                              setIsEditingProfile(false);
                            }}
                            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg transition"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
                          >
                            Save Changes
                          </button>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Preferences settings tab */}
              {activeTab === "preferences" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Preferences</h2>
                    <p className="text-xs text-slate-400">Customize the application options.</p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {/* Push notifications */}
                    <div className="flex items-center justify-between py-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800">Push Notifications</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Receive visual alerts whenever user posts get likes or feedback.</p>
                      </div>
                      <ToggleSwitch checked={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} />
                    </div>

                    {/* Email Digest */}
                    <div className="flex items-center justify-between py-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800">Weekly Digests</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Get weekly newsletters on hot posts and popular actions.</p>
                      </div>
                      <ToggleSwitch checked={emailDigest} onChange={() => setEmailDigest(!emailDigest)} />
                    </div>

                    {/* Image quality select */}
                    <div className="flex items-center justify-between py-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800">Upload Optimization</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Choose preferred image compression size criteria.</p>
                      </div>
                      <select 
                        value={imageQuality} 
                        onChange={(e) => setImageQuality(e.target.value)}
                        className="px-2 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400 transition"
                      >
                        <option value="raw">Original (None)</option>
                        <option value="high">HD Optimized</option>
                        <option value="standard">Standard Compressed</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy & Security Tab */}
              {activeTab === "privacy" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Privacy & Security</h2>
                    <p className="text-xs text-slate-400">Control your privacy details and verify security authority.</p>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {/* Private profile */}
                    <div className="flex items-center justify-between py-4">
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-slate-800">Private Profile Visibility</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Restrict post viewing privileges to approved users.</p>
                      </div>
                      <ToggleSwitch checked={profilePrivate} onChange={() => setProfilePrivate(!profilePrivate)} />
                    </div>

                    {/* Security statement */}
                    <div className="py-4 space-y-1">
                      <h4 className="text-xs font-bold text-slate-800 font-sans">Authentication Authority</h4>
                      <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                        Your password and session security are securely brokered externally by <strong>Auth0 Identity Cloud</strong>.
                      </p>
                    </div>

                    {/* Danger zone */}
                    <div className="pt-6 pb-2 space-y-3">
                      <div>
                        <h4 className="text-xs font-bold text-rose-600 uppercase tracking-wider">Danger Zone</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                          Permanently delete your personal profile data and files from the application servers.
                        </p>
                      </div>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 rounded-lg text-xs font-bold border border-rose-150 transition"
                      >
                        Delete Personal Account
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* About settings tab */}
              {activeTab === "about" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">About</h2>
                    <p className="text-xs text-slate-400">Platform architecture details and code license.</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      SocialImage is a visual catalog app constructed using a React frontend on Vite, and a Node Express backend using a MongoDB database and optional Redis caching capabilities.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">Version</span>
                        <span className="text-xs font-bold text-slate-800">1.2.0 (Stable)</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">License</span>
                        <span className="text-xs font-bold text-slate-800">ISC License</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Need developer support?</span>
                      <a 
                        href="https://github.com" 
                        target="_blank" 
                        rel="noreferrer" 
                        className="px-2.5 py-1 text-slate-600 hover:text-slate-800 hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm font-semibold transition"
                      >
                        Visit GitHub
                      </a>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Setting;
