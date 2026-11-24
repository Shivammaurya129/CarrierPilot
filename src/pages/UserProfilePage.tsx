import React, { useState, useEffect } from "react";
import { useAuth, UserProfile } from "../context/AuthContext.tsx";
import { useToast } from "../components/Toast.tsx";
import { User, School, Award, MapPin, Tag, Briefcase, Save, Plus, X, Sparkles } from "lucide-react";

export default function UserProfilePage() {
  const { profile, updateProfileData, profileCompletion } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setPhotoURL(profile.photoURL || "");
      setCollege(profile.college || "");
      setDegree(profile.degree || "");
      setBranch(profile.branch || "");
      setSkills(profile.skills || []);
      setTargetRole(profile.targetRole || "");
    }
  }, [profile]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
      setSkillInput("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, idx) => idx !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfileData({
        name,
        photoURL,
        college,
        degree,
        branch,
        skills,
        targetRole,
      });
      success("Profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      error(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8" id="profile-page">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-display text-white flex items-center gap-2">
            <User className="w-8 h-8 text-emerald-400" />
            User Profile
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Configure your professional matrix to refine AI personalized feedback.
          </p>
        </div>
        <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-card text-xs font-mono text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          Profile Completion: {profileCompletion}%
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Avatar Display card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center space-y-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-3xl overflow-hidden uppercase shadow-lg shadow-emerald-500/10">
                {photoURL ? (
                  <img src={photoURL} alt={name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  name ? name.substring(0, 2) : "CP"
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-[10px] text-slate-950 font-bold">
                ✓
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold font-display text-white">{name || "Your Name"}</h3>
              <p className="text-xs text-slate-400">{profile?.email}</p>
              {targetRole && (
                <span className="inline-block mt-2 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  {targetRole}
                </span>
              )}
            </div>

            {/* Completion Bar */}
            <div className="w-full space-y-1 pt-2">
              <div className="flex justify-between text-[10px] font-mono text-slate-500 font-bold uppercase">
                <span>Profile Strengths</span>
                <span>{profileCompletion}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full transition-all duration-500"
                  style={{ width: `${profileCompletion}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Configuration Matrix Form */}
        <form onSubmit={handleSave} className="lg:col-span-8 glass-panel p-6 rounded-2xl space-y-6" id="profile-form">
          <h3 className="text-lg font-semibold font-display text-white pb-2 border-b border-white/10">
            Professional Profile Matrix
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Khushi Aggarwal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-lg text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Photo URL
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="url"
                  placeholder="e.g. https://example.com/photo.jpg"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-lg text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                College / Institution
              </label>
              <div className="relative">
                <School className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Delhi Technological University"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-lg text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Degree Program
              </label>
              <div className="relative">
                <Award className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Bachelor of Technology"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-lg text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Branch / Specialization
              </label>
              <div className="relative">
                <Award className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Computer Science and Engineering"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-lg text-white"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                Target Role
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. Software Engineer"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* Skill Tag Config */}
          <div className="space-y-3 pt-2">
            <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold block">
              Core Skills & Technologies
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="e.g. React, Python, Cloud Architecture"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                  className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-lg text-white"
                />
              </div>
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-emerald-400 border border-white/10 rounded-lg text-sm font-semibold flex items-center justify-center cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {skills.length === 0 ? (
                <span className="text-xs text-slate-500 font-mono italic">No skills listed yet. Add some above!</span>
              ) : (
                skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold glass-card text-slate-300"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(idx)}
                      className="hover:text-rose-400 text-slate-500 font-bold"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving Changes..." : "Save Profile Matrix"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
