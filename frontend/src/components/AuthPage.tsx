import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { authAPI, setAuthTokens, type RegisterData, type LoginData } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface AuthPageProps {
  onSignIn: (user: any) => void;
  initialMode?: "signin" | "signup";
}

const AuthPage = ({ onSignIn, initialMode = "signin" }: AuthPageProps) => {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Form state
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validateGmailEmail = (email: string): boolean => {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain === 'gmail.com' || domain === 'googlemail.com';
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Gmail
    if (!validateGmailEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please use a Gmail address (@gmail.com)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const loginData: LoginData = { email, password };
      const response = await authAPI.login(loginData);
      
      // Save tokens
      setAuthTokens(response.access, response.refresh);
      
      // Get user profile
      const profile = await authAPI.getProfile();
      localStorage.setItem('user', JSON.stringify(profile.user));
      
      toast({
        title: "Success!",
        description: "Signed in successfully",
      });
      
      onSignIn(profile.user);
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = "Invalid email or password";
      
      // Check if email doesn't exist
      if (error.response?.status === 401) {
        errorMessage = "Email doesn't exist or password is incorrect";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Gmail
    if (!validateGmailEmail(email)) {
      toast({
        title: "Invalid Email",
        description: "Please use a Gmail address (@gmail.com). Only Gmail accounts are supported.",
        variant: "destructive",
      });
      return;
    }

    // Validation
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords don't match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const registerData: RegisterData = {
        email,
        username,
        name,
        password,
        password_confirm: confirmPassword,
      };
      
      const response = await authAPI.register(registerData);
      
      // Save tokens
      setAuthTokens(response.tokens.access, response.tokens.refresh);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      toast({
        title: "Success!",
        description: "Account created successfully",
      });
      
      onSignIn(response.user);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errorMessage = errors.username?.[0] || 
                      errors.email?.[0] ||
                      errors.password?.[0] ||
                      errorMessage;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast({
      title: "Coming Soon",
      description: "Google Sign-In will be available soon! For now, please use a Gmail address to sign up.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {mode === "signin" ? "Welcome back" : "Create an account"}
          </CardTitle>
          <CardDescription className="text-center">
            {mode === "signin"
              ? "Sign in with your Gmail account"
              : "Sign up with your Gmail account to start"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Google Sign In Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={mode === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
            {mode === "signup" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Gmail Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Only Gmail addresses (@gmail.com) are supported
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "signin" ? "Sign In" : "Sign Up"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <Button
              variant="link"
              className="p-0 h-auto font-normal"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
              disabled={isLoading}
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AuthPage;