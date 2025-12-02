import { useState } from "react";
import { View, StyleSheet } from "react-native";
import { WelcomeScreen } from "./onboarding/WelcomeScreen";
import { DomainSetupScreen } from "./onboarding/DomainSetupScreen";
import { LoginScreen } from "./onboarding/LoginScreen";

interface OnboardingProps {
  onComplete: (domain: string, token: string) => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [domain, setDomain] = useState("");

  const handleWelcomeComplete = () => {
    setStep(2);
  };

  const handleDomainSetup = (enteredDomain: string) => {
    setDomain(enteredDomain);
    setStep(3);
  };

  const handleLoginSuccess = (token: string) => {
    onComplete(domain, token);
  };

  return (
    <View style={styles.container}>
      {step === 1 && <WelcomeScreen onContinue={handleWelcomeComplete} />}
      {step === 2 && <DomainSetupScreen onContinue={handleDomainSetup} />}
      {step === 3 && <LoginScreen domain={domain} onLoginSuccess={handleLoginSuccess} onBack={() => setStep(2)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
});
