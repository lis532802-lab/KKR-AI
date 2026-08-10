export class SpeechController {
    constructor(onSpeechResult) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.onresult = (e) => {
                const transcript = e.results[0][0].transcript;
                onSpeechResult(transcript);
            };
        }
        this.synth = window.speechSynthesis;
    }

    startListening() {
        if (this.recognition) this.recognition.start();
    }

    speak(text) {
        if (!this.synth) return;
        this.synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        this.synth.speak(utterance);
    }
}
