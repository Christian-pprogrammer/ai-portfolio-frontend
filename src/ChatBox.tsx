import { useState, useEffect, useRef } from "react";
import { Download, MessageSquare, X, Send, Bot, User, Linkedin, Github, Mail, Code, Database, Cloud, Cpu } from "lucide-react";
import axios from "axios";

type Message = { 
  sender: "user" | "bot"; 
  text: string;
  isStreaming?: boolean;
};

export default function Portfolio() {
  const [chatOpen, setChatOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  // generate a uuid session id on component mount
  useEffect(() => {
    const uuid = crypto.randomUUID();
    setSessionId(uuid);
  }, []);
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      sender: "bot", 
      text: "Hello! I'm Chris's AI assistant. I can tell you about his experience, skills, projects, and technical expertise. What would you like to know?" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const accumulatedTextRef = useRef('');
  
  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (chatOpen) {
      inputRef.current?.focus();
    }
  }, [chatOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
  
    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
  
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    setMessages(prev => [...prev, { sender: "bot", text: "", isStreaming: true }]);
  
    try {
      const base_url = process.env.REACT_APP_BASE_URL || 'https://ai-portfolio-backend-smoky.vercel.app';
  
      const response = await fetch(`${base_url}/api/chat/stream/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userMessage, session_id: sessionId }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
  
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
  
      if (!reader) {
        throw new Error('No reader available');
      }
  
      accumulatedTextRef.current = '';
  
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
  
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n\n');
  
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
  
            if (data.error) {
              throw new Error(data.error);
            }
  
            if (data.done) {
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.sender === "bot") lastMessage.isStreaming = false;
                return newMessages;
              });
            } else if (data.content) {
              accumulatedTextRef.current += data.content;

              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage.sender === "bot") {
                  lastMessage.text = accumulatedTextRef.current;
                }
                return newMessages;
              });


            }
          }
        }
      }
  
    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          sender: "bot",
          text: "Sorry, I encountered an error. Please try again.",
          isStreaming: false
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };
  

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);

    try {

      const base_url = process.env.REACT_APP_BASE_URL

      console.log(contactForm)

      console.log("Submitting contact form to:", `${base_url}/api/contact/`)

      const response = await axios
        .post(`${base_url}/api/contact/`, contactForm);

      if (response.status === 200) {
        setFormSubmitted(true);
        setContactForm({ name: "", email: "", message: "" });
        setTimeout(() => setFormSubmitted(false), 5000);
        alert("Message sent successfully!");
      }else {
        console.log("Response:", response);
        let message = response.data?.message[0] || "An error occurred";
        throw new Error("Failed to send message: " + message);
      }
    } catch (error: any) {
      const backendError = error.response?.data.detail || error.response?.data?.message[0] || "Failed to send message";
      alert("Error: " + backendError);
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-200 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-slate-800">Chris</div>
          <div className="flex gap-6 items-center">
            <a href="#about" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">About</a>
            <a href="#skills" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Skills</a>
            <a href="#contact" className="text-slate-600 hover:text-slate-900 transition-colors font-medium">Contact</a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Column */}
            <div className="flex-1 space-y-8">
              <div className="space-y-4">
                <div className="inline-block px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                 Available for opportunities
                </div>
                <h1 className="text-4xl font-bold text-slate-900 leading-tight">
                  Hi, I'm <span className="text-slate-700">Christian MPANO (Chris)</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Full-Stack Developer specializing in AI-powered solutions. I build scalable applications with modern technologies, from intelligent chatbots to enterprise-grade systems. Passionate about clean code, user experience, and turning complex problems into elegant solutions.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="https://docs.google.com/document/d/1RFsh3T5UCimxfNRqf4YNnXd0vjLTP8xC/export?format=pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group px-8 py-4 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
              >
                <Download className="w-5 h-5 group-hover:animate-bounce" />
                Download Resume
              </a>

                <button
                  onClick={() => setChatOpen(true)}
                  className="px-8 py-4 bg-white text-slate-800 border-2 border-slate-800 rounded-lg font-semibold hover:bg-slate-800 hover:text-white transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                >
                  <MessageSquare className="w-5 h-5" />
                  Chat with Chris AI
                </button>
              </div>

              {/* Social Links */}
              <div className="flex gap-4 pt-4">
                <a href="https://www.linkedin.com/in/christian-mpano-539608255/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://github.com/Christian-pprogrammer" target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110">
                  <Github className="w-5 h-5" />
                </a>
                <a href="mailto:mpanoc6@gmail.com" className="w-12 h-12 bg-slate-100 hover:bg-slate-800 text-slate-700 hover:text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110">
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Right Column - Professional Image */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="w-80 h-96 lg:w-96 lg:h-[28rem] rounded-2xl shadow-2xl overflow-hidden">
                  <img 
                    src="/profile.png" 
                    alt="Chris - Full Stack Developer" 
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Decorative Element */}
                <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-slate-800 rounded-2xl -z-10"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skills Section */}
      <div id="skills" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-12 text-center">Technical Expertise</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Code, title: "Frontend", skills: "React, TypeScript, Next.js, Tailwind CSS" },
              { icon: Database, title: "Backend", skills: "Node.js, Python, SpringBoot, PostgreSQL, MongoDB" },
              { icon: Cloud, title: "Cloud & DevOps", skills: "AWS, Docker, CI/CD, Kubernetes" },
              { icon: Cpu, title: "AI & ML", skills: "NLP, Transformers, LLMs, LangChain, Hugging" }
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-400 transition-all duration-200 hover:shadow-lg">
                <item.icon className="w-10 h-10 text-slate-700 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.skills}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="py-20 px-6 bg-slate-50">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold text-slate-900 mb-4 text-center">Get In Touch</h2>
          <p className="text-slate-600 text-center mb-12">Have a project in mind? Let's talk about it.</p>
          
          {formSubmitted && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg text-center">
              ✓ Message sent successfully! I'll get back to you soon.
            </div>
          )}

          <form onSubmit={handleContactSubmit} className="bg-white rounded-2xl shadow-lg p-8 space-y-6 border border-gray-200">
            <div>
              <label className="block text-slate-700 font-medium mb-2">Name</label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                placeholder="Your name"
                min={2}
                max={100}
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2">Email</label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all"
                placeholder="your.email@example.com"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-2">Message</label>
              <textarea
                required
                rows={5}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all resize-none"
                placeholder="Tell me about your project..."
                minLength={10}
              />
            </div>

            <button
              type="submit"
              disabled={formSubmitting}
              className="w-full bg-slate-800 text-white py-4 rounded-lg font-semibold hover:bg-slate-900 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {formSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Message
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-slate-400">© 2024 Chris. All rights reserved.</p>
        </div>
      </footer>

      {/* Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-slate-800 text-white rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Chat with Chris AI</h2>
                  <p className="text-slate-300 text-sm">Ask me anything about Chris</p>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="w-10 h-10 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  {msg.sender === "bot" && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[75%] rounded-xl px-4 py-3 ${
                      msg.sender === "user"
                        ? "bg-slate-800 text-white"
                        : "bg-white text-slate-800 border border-gray-200 shadow-sm"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                      {msg.isStreaming && (
                        <span className="inline-block w-0.5 h-4 bg-slate-600 ml-1 animate-pulse" />
                      )}
                    </p>
                  </div>

                  {msg.sender === "user" && (
                    <div className="w-8 h-8 rounded-lg bg-slate-600 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-200 bg-white rounded-b-2xl">
              <div className="flex gap-3">
                <input
                  ref={inputRef}
                  className="flex-1 bg-gray-100 text-slate-900 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent placeholder-gray-500 transition-all"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about skills, experience, projects..."
                  disabled={isLoading}
                />
                <button
                  className="bg-slate-800 text-white px-6 rounded-lg font-medium transition-all hover:bg-slate-900 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline-block">Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}