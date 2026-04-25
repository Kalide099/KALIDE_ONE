from rest_framework import generics
from .models import Message
from .serializers import MessageSerializer


class MessageCreateView(generics.CreateAPIView):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer

    def perform_create(self, serializer):
        content = serializer.validated_data.get('content', '')
        source_lang = serializer.validated_data.get('source_language', 'en')
        
        # Simulate AI Translation for MVP
        translated_content = {}
        if source_lang == 'en':
            translated_content['fr'] = f"[Traduit par l'IA]: {content}"
            translated_content['es'] = f"[Traducido por IA]: {content}"
        elif source_lang == 'fr':
            translated_content['en'] = f"[Translated by AI]: {content}"
            translated_content['es'] = f"[Traducido por IA]: {content}"
        else:
            translated_content['en'] = f"[Translated by AI]: {content}"
            translated_content['fr'] = f"[Traduit par l'IA]: {content}"

        serializer.save(translated_content=translated_content)
