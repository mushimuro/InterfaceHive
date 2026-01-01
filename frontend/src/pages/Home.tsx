import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { ArrowRight, Code2, Users, Award, Sparkles, Rocket } from 'lucide-react';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="bg-muted/50 border-b">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center gap-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>Platform for Collaborative Development</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Build Amazing Projects
              <br />
              <span className="text-primary">Together</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              InterfaceHive connects developers to collaborate on open-source projects.
              Contribute your skills, earn credits, and grow your portfolio.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {user ? (
                <>
                  <Button asChild size="lg" className="text-base">
                    <Link to="/projects">
                      <Code2 className="mr-2 h-5 w-5" />
                      Browse Projects
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-base">
                    <Link to="/projects/create">
                      <Rocket className="mr-2 h-5 w-5" />
                      Create Project
                    </Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="lg" className="text-base">
                    <Link to="/auth/register">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="text-base">
                    <Link to="/projects">
                      Browse Projects
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose InterfaceHive?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A platform designed for developers who want to collaborate and grow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <Card className="relative overflow-hidden border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Code2 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Find Projects</CardTitle>
              <CardDescription className="text-base">
                Discover open-source projects that match your skills and interests.
                Filter by technology, difficulty, and estimated time.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Collaborate</CardTitle>
              <CardDescription className="text-base">
                Work with other developers on real projects.
                Submit contributions, get feedback, and improve your skills.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden border-2">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-xl">Earn Credits</CardTitle>
              <CardDescription className="text-base">
                Build your reputation by earning credits for accepted contributions.
                Showcase your achievements and expertise.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-muted/50 border-t">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Building?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join our community of developers and start contributing to exciting projects today.
            </p>
            {!user && (
              <Button asChild size="lg" className="text-base">
                <Link to="/auth/register">
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-primary mb-2">Open Source</p>
            <p className="text-muted-foreground">Built for the community</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary mb-2">Collaborative</p>
            <p className="text-muted-foreground">Work together on projects</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary mb-2">Credit System</p>
            <p className="text-muted-foreground">Recognition for contributions</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

