import React, { useState, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  Building2,
  Bookmark,
  CheckCircle2,
  Filter,
  Star,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// --- Types ---
type JobStatus = 'new' | 'saved' | 'applied';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  postedAt: string;
  matchScore: number;
  status: JobStatus;
  description: string;
  tags: string[];
}

// Real jobs will be fetched directly via Remotive API inside useEffect.

function App() {
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userName, setUserName] = useState('');
  const [qualification, setQualification] = useState('');
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    const fetchRealJobs = async () => {
      setLoadingJobs(true);
      try {
        const res = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=150");
        const data = await res.json();
        
        const realJobs: Job[] = data.jobs.slice(0, 200).map((apiJob: any) => {
          let descriptionStr = (apiJob.description || "").replace(/<[^>]*>?/gm, "").substring(0, 300) + "...";
          let locationStr = apiJob.candidate_required_location || "Remote Anywhere";
          let tags = apiJob.tags && apiJob.tags.length > 0 ? apiJob.tags.slice(0, 4) : ["Software Engineering"];
          let matchScore = Math.floor(Math.random() * 30) + 70; // Simulate match
          
          let dateDiff = Math.floor((new Date().getTime() - new Date(apiJob.publication_date).getTime()) / (1000 * 3600 * 24));
          let postedStr = dateDiff === 0 ? "Today" : dateDiff + " days ago";

          return {
            id: String(apiJob.id),
            title: apiJob.title,
            company: apiJob.company_name,
            location: locationStr,
            type: apiJob.job_type ? apiJob.job_type.replace("_", "-") : "Full-time",
            salary: apiJob.salary ? apiJob.salary : "Competitive",
            postedAt: postedStr,
            matchScore,
            status: 'new' as JobStatus,
            description: descriptionStr,
            tags
          };
        });
        
        setJobs(realJobs);
      } catch (err) {
        console.error("Failed to load jobs", err);
      } finally {
        setLoadingJobs(false);
      }
    };
    
    fetchRealJobs();
  }, []);
  const [activeTab, setActiveTab] = useState<"discover" | "saved" | "applied">("discover");
  const [searchQuery, setSearchQuery] = useState("");

  const handleApplyOnboarding = (e: React.FormEvent) => {
    e.preventDefault();
    if (userName.trim() && qualification.trim()) {
      setIsOnboarded(true);
    }
  };

  const toggleJobStatus = (jobId: string, newStatus: JobStatus) => {
    setJobs(prevJobs => 
      prevJobs.map(job => 
        job.id === jobId 
          ? { ...job, status: job.status === newStatus ? 'new' : newStatus } 
          : job
      )
    );
  };

  const filteredJobs = jobs.filter(job => {
    if (activeTab === 'saved' && job.status !== 'saved') return false;
    if (activeTab === 'applied' && job.status !== 'applied') return false;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        job.title.toLowerCase().includes(query) ||
        job.company.toLowerCase().includes(query) ||
        job.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    return true;
  }).sort((a, b) => b.matchScore - a.matchScore);


  // --- Welcome / Onboarding Screen ---
  if (!isOnboarded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full animate-fade-in-up border border-slate-100">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 mx-auto shadow-lg shadow-blue-200">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 text-center tracking-tight">
            Welcome to JobSignal
          </h1>
          <p className="text-slate-500 text-center mb-8">
            Tell us a bit about yourself so we can curate the best opportunities for you.
          </p>

          <form onSubmit={handleApplyOnboarding} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Jane Doe"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            
            <div>
              <label htmlFor="qual" className="block text-sm font-semibold text-slate-700 mb-1.5">
                Primary Qualification / Role
              </label>
              <input
                id="qual"
                type="text"
                required
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                placeholder="e.g. Software Engineer, B.S. Comp Sci"
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-slate-400"
              />
            </div>

            <button 
              type="submit"
              className="w-full mt-4 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-200 active:scale-95"
            >
              Enter JobSignal
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- Main Application Dashboard ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans animate-fade-in-up">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10 animate-fade-in-up delay-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                JobSignal
              </span>
            </div>
            
            <div className="hidden md:flex space-x-2">
              <button 
                onClick={() => setActiveTab('discover')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === 'discover' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Search className="w-4 h-4" />
                Matches
              </button>
              <button 
                onClick={() => setActiveTab('saved')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === 'saved' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                Saved
                <span className="bg-slate-200 text-slate-700 py-0.5 px-2 rounded-full text-xs">{jobs.filter(j => j.status === 'saved').length}</span>
              </button>
              <button 
                onClick={() => setActiveTab('applied')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
                  activeTab === 'applied' 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Applied
                <span className="bg-slate-200 text-slate-700 py-0.5 px-2 rounded-full text-xs">{jobs.filter(j => j.status === 'applied').length}</span>
              </button>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-500 hidden sm:block">
                Hello, {userName.split(' ')[0]}
              </span>
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {userName.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up delay-200">
        
        {/* Header & Search */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Profile: {qualification}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
            {activeTab === 'discover' && 'Your curated matches'}
            {activeTab === 'saved' && 'Saved algorithms'}
            {activeTab === 'applied' && 'Application pipeline'}
          </h1>
          <p className="text-slate-500 mb-6 text-lg">
            {activeTab === 'discover' && `Filtered from thousands of postings perfectly matched to your profile as a ${qualification}.`}
            {activeTab === 'saved' && 'Review and apply when you are ready.'}
            {activeTab === 'applied' && 'Keep track of where you stand in the process.'}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search by title, company, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm outline-none transition-shadow"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 rounded-xl bg-white text-slate-700 hover:bg-slate-50 font-semibold shadow-sm transition-colors">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Job List */}
        <div className="grid gap-5">
          {loadingJobs ? (
            <div className="flex flex-col items-center justify-center py-20 text-indigo-500">
              <Sparkles className="animate-pulse mb-4" size={48} />
              <p className="text-lg font-medium text-slate-600">Scraping Real IT Jobs from Web...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm animate-fade-in-up delay-300">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900">No jobs found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            filteredJobs.slice(0, 50).map((job, idx) => (
              <div 
                key={job.id} 
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group animate-fade-in-up"
                style={{ animationDelay: `${(idx % 10) * 50 + 200}ms` }}
              >
                
                {/* Score Indicator */}
                <div className="absolute top-0 right-0">
                  <div className={`px-4 py-1.5 text-sm font-bold flex items-center gap-1.5 rounded-bl-2xl
                    ${job.matchScore >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}
                  `}>
                    <Star className="w-4 h-4 fill-current" />
                    {job.matchScore}% Match
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 md:items-start pt-2">
                  
                  {/* Company Logo Placeholder */}
                  <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-7 h-7 text-slate-400" />
                  </div>
                  
                  {/* Job Info */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{job.title}</h2>
                      {job.postedAt.includes('hour') && activeTab === 'discover' && (
                        <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-md">
                          HOT
                        </span>
                      )}
                    </div>
                    
                    <div className="text-base text-slate-600 mb-3 font-medium">
                      {job.company}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500 mb-4 font-medium">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-4 h-4" />
                        {job.postedAt}
                      </div>
                    </div>
                    
                    <p className="text-slate-600 text-sm leading-relaxed mb-4 max-w-2xl">
                      {job.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
                      {job.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex flex-row md:flex-col gap-3 md:pt-4 min-w-[140px]">
                    <button 
                      onClick={() => toggleJobStatus(job.id, 'applied')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all ${
                        job.status === 'applied'
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200'
                          : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200'
                      }`}
                    >
                      {job.status === 'applied' ? (
                        <><CheckCircle2 className="w-4 h-4" /> Applied</>
                      ) : (
                        'Apply Now'
                      )}
                    </button>
                    <button 
                      onClick={() => toggleJobStatus(job.id, 'saved')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold border-2 transition-all ${
                        job.status === 'saved'
                          ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${job.status === 'saved' ? 'fill-current' : ''}`} />
                      {job.status === 'saved' ? 'Saved' : 'Save'}
                    </button>
                  </div>

                </div>
              </div>
            ))
          )}
          {filteredJobs.length > 50 && (
             <div className="text-center py-8 text-slate-500 animate-fade-in-up delay-[2000ms]">
               Showing 50 of {filteredJobs.length} match results. Adjust filters to refine further.
             </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
