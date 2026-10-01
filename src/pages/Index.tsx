import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Scale, MessageSquare, FileText, Calendar, ArrowRight } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Scale className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">AdhikarAI</span>
          </div>
          <Button onClick={() => navigate('/auth')}>Get Started</Button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-8 mb-20">
          <h1 className="text-5xl md:text-6xl font-bold">
            Legal Compliance Made <span className="text-primary">Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered legal tools for Indian MSMEs. Manage compliance, generate documents, and get instant legal guidance.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
            Start Free <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            { icon: MessageSquare, title: 'AI Legal Chatbot', desc: 'Get instant answers to MSME legal questions' },
            { icon: FileText, title: 'Document Generator', desc: 'Create legal documents in minutes' },
            { icon: Calendar, title: 'Compliance Calendar', desc: 'Never miss a deadline again' }
          ].map((feature) => (
            <div key={feature.title} className="p-6 rounded-lg border bg-card hover:shadow-medium transition-all">
              <feature.icon className="h-12 w-12 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Index;
