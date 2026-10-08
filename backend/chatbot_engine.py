"""
ChatbotEngine - Motor de Inteligência Artificial & Consultoria de Moda Amoda
Projeto: Amoda — Moda Feminina & Consultoria Virtual
Camada: Camada 2 — Inteligência Artificial, RAG & PLN

Responsável por:
1. Sofia — Consultora Virtual de Moda Feminina da loja Amoda.
2. Indexação de produtos, guia de medidas, looks por ocasião e rastreio de pedidos.
3. Orquestração com LLM Generativa (Groq API / Llama-3) com ancoragem factual estrita (zero alucinação).
4. Motor Léxico e Fallback Offline de alta precisão.
5. Gestão de métricas e sugestões interativas.
"""

import os
import json
import re
import string
import uuid
import unicodedata
import urllib.request
import urllib.error
from datetime import datetime
from typing import Dict, List, Optional, Any, Tuple


class ChatbotEngine:
    """
    Motor de Inteligência Artificial e Consultoria de Moda da Amoda.
    """

    # Sugestões Rápidas Oficiais da Tela Inicial e Chat
    SUGESTOES_PADRAO = [
        "Ver produtos",
        "Novidades",
        "Encontrar meu tamanho",
        "Montar um look",
        "Dúvidas sobre pedidos"
    ]

    STOPWORDS_PT = {
        "a", "o", "as", "os", "um", "uma", "uns", "umas",
        "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
        "por", "para", "com", "sem", "sob", "sobre", "tras", "atras",
        "e", "ou", "mas", "porem", "contudo", "todavia", "que", "se",
        "como", "qual", "quais", "quando", "onde", "quem", "quanto", "quantos", "quanta", "quantas",
        "por que", "porque", "por que?", "pq",
        "e", "eh", "sao", "era", "eram", "foi", "ser", "estar", "estou", "esta", "estamos", "estao",
        "tem", "temos", "ter", "ha", "havia",
        "me", "te", "se", "nos", "vos", "lhe", "lhes", "mim", "ti",
        "meu", "minha", "meus", "minhas", "seu", "sua", "seus", "suas", "nosso", "nossa",
        "esse", "essa", "esses", "essas", "este", "esta", "estes", "estas", "isso", "isto", "aquilo",
        "aquele", "aquela", "aqueles", "aquelas",
        "ja", "mais", "muito", "pouco", "tambem", "so", "apenas", "bem", "mal",
        "voce", "voces", "vc", "vcs", "eu", "ele", "ela", "eles", "elas"
    }

    SAUDACOES = [
        "ola", "olá", "oi", "oie", "opa", "bom dia", "boa tarde", "boa noite",
        "e ai", "e aí", "tudo bem", "tudo bom", "fala", "hello", "hi", "hey"
    ]

    def __init__(
        self,
        knowledge_base_path: Optional[str] = None,
        env_path: Optional[str] = None
    ) -> None:
        self._load_env(env_path)

        self.groq_api_key = os.environ.get("GROQ_API_KEY", "").strip()
        self.groq_model = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
        self.groq_api_url = "https://api.groq.com/openai/v1/chat/completions"

        self.knowledge_base_path = knowledge_base_path
        self.knowledge_base: Dict[str, Any] = self._load_knowledge_base(knowledge_base_path)

        # Histórico multi-turn por sessão
        self.conversation_histories: Dict[str, List[Dict[str, str]]] = {}

        # Métricas
        self.metrics: Dict[str, Any] = {
            "total_messages": 0,
            "resolved_by_llm": 0,
            "resolved_by_knowledge_base": 0,
            "resolved_by_order_tracker": 0,
            "fallback_messages": 0,
            "greetings": 0,
            "positive_feedback": 0,
            "negative_feedback": 0,
            "feedbacks": {}
        }

    def _load_env(self, env_path: Optional[str] = None) -> None:
        possible_paths = []
        if env_path:
            possible_paths.append(env_path)

        current_dir = os.path.dirname(os.path.abspath(__file__))
        possible_paths.extend([
            os.path.join(current_dir, ".env"),
            os.path.join(current_dir, "..", ".env"),
            os.path.join(os.getcwd(), ".env"),
            os.path.join(os.getcwd(), "backend", ".env")
        ])

        for path in possible_paths:
            if os.path.isfile(path):
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        for line in f:
                            line = line.strip()
                            if not line or line.startswith("#"):
                                continue
                            if "=" in line:
                                key, value = line.split("=", 1)
                                key = key.strip()
                                value = value.strip().strip("'\"")
                                if key and key not in os.environ:
                                    os.environ[key] = value
                    break
                except Exception as e:
                    print(f"[ChatbotEngine] Aviso ao ler .env ({path}): {e}")

    def _load_knowledge_base(self, path: Optional[str] = None) -> Dict[str, Any]:
        possible_paths = []
        if path:
            possible_paths.append(path)

        current_dir = os.path.dirname(os.path.abspath(__file__))
        possible_paths.extend([
            os.path.join(current_dir, "base_conhecimento.json"),
            os.path.join(current_dir, "..", "backend", "base_conhecimento.json"),
            os.path.join(os.getcwd(), "backend", "base_conhecimento.json"),
            os.path.join(os.getcwd(), "base_conhecimento.json")
        ])

        for file_path in possible_paths:
            if os.path.isfile(file_path):
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        return json.load(f)
                except Exception as e:
                    print(f"[ChatbotEngine] Erro ao carregar base de conhecimento ({file_path}): {e}")

        return {
            "empresa": "Amoda Moda Feminina",
            "descricao": "Loja de moda feminina com roupas elegantes, casuais e de festa.",
            "produtos": [],
            "topicos": []
        }

    # =========================================================================
    # 2. PROCESSAMENTO DE TEXTO & PLN LÉXICO
    # =========================================================================

    def _normalize_text(self, text: str) -> str:
        if not text:
            return ""
        text = unicodedata.normalize("NFKD", text).encode("ASCII", "ignore").decode("utf-8")
        text = text.lower()
        for char in string.punctuation:
            text = text.replace(char, " ")
        return " ".join(text.split())

    def _extract_tokens(self, text: str) -> set:
        normalized = self._normalize_text(text)
        words = normalized.split()
        return {w for w in words if w not in self.STOPWORDS_PT and len(w) > 1}

    def _is_greeting(self, text: str) -> bool:
        norm = self._normalize_text(text)
        if norm in self.SAUDACOES:
            return True
        for saudacao in self.SAUDACOES:
            if norm.startswith(saudacao + " ") or norm.endswith(" " + saudacao):
                return True
        return False

    def _check_order_code(self, text: str) -> Optional[Dict[str, Any]]:
        """Verifica se o usuário digitou um código de pedido (ex: PED-1048 ou 1048)."""
        orders = self.knowledge_base.get("pedidos_exemplo", {})
        norm = text.upper().strip()

        # Busca formato direto PED-XXXX
        match = re.search(r"PED-\d{4}", norm)
        if match:
            code = match.group(0)
            if code in orders:
                return orders[code]

        # Busca número puro de 4 dígitos
        match_num = re.search(r"\b(\d{4})\b", norm)
        if match_num:
            code = f"PED-{match_num.group(1)}"
            if code in orders:
                return orders[code]

        return None

    def _format_order_response(self, order: Dict[str, Any]) -> str:
        itens_str = "\n".join([f"  - {item}" for item in order.get("itens", [])])
        return (
            f"### 📦 Detalhes do Pedido **{order['id']}**\n\n"
            f"* 👤 **Cliente:** {order.get('cliente', 'Cliente Amoda')}\n"
            f"* 📅 **Data da Compra:** {order.get('data', 'Recente')}\n"
            f"* 🛍️ **Itens:**\n{itens_str}\n"
            f"* 💰 **Valor Total:** {order.get('total', 'R$ 0,00')}\n"
            f"* 🚚 **Status da Entrega:** **{order.get('status', 'Em processamento')}**\n"
            f"* 📍 **Código de Rastreio:** `{order.get('rastreio', 'Aguardando envio')}` ({order.get('transportadora', 'Transportadora')})\n"
            f"* ⏰ **Previsão:** {order.get('previsao_entrega', 'Em até 3 dias úteis')}\n\n"
            f"Precisa de mais alguma ajuda com este pedido?"
        )

    # =========================================================================
    # 3. RAG LOCAL & SIMILARIDADE LÉXICA
    # =========================================================================

    def _search_knowledge_base(self, user_message: str) -> Tuple[Optional[str], float, Optional[str]]:
        """Busca a melhor resposta na base de tópicos da Amoda."""
        user_tokens = self._extract_tokens(user_message)
        if not user_tokens:
            return None, 0.0, None

        best_score = 0.0
        best_topic = None
        best_response = None

        topicos = self.knowledge_base.get("topicos", [])
        for topico in topicos:
            for pergunta in topico.get("perguntas_chave", []):
                p_tokens = self._extract_tokens(pergunta)
                if not p_tokens:
                    continue
                intersection = user_tokens.intersection(p_tokens)
                union = user_tokens.union(p_tokens)
                jaccard = len(intersection) / len(union) if union else 0.0

                overlap = len(intersection) / len(p_tokens) if p_tokens else 0.0
                score = (jaccard * 0.4) + (overlap * 0.6)

                # Match exato de termos chave (ex: "ver produtos", "novidades")
                if self._normalize_text(pergunta) == self._normalize_text(user_message):
                    score = 1.0

                if score > best_score:
                    best_score = score
                    best_topic = topico.get("id")
                    best_response = topico.get("resposta")

        return best_response, best_score, best_topic

    def _search_products(self, user_message: str) -> List[Dict[str, Any]]:
        """Busca produtos relevantes no catálogo com base na mensagem."""
        user_tokens = self._extract_tokens(user_message)
        products = self.knowledge_base.get("produtos", [])
        matched = []

        for p in products:
            p_text = f"{p.get('nome', '')} {p.get('categoria', '')} {' '.join(p.get('ocasiao', []))} {p.get('tecido', '')}"
            p_tokens = self._extract_tokens(p_text)
            if user_tokens.intersection(p_tokens):
                matched.append(p)

        return matched

    # =========================================================================
    # 4. LLM GENERATIVA (GROQ API / LLAMA-3)
    # =========================================================================

    def _build_system_prompt(self) -> str:
        """Monta o prompt de sistema especializado na Amoda para a LLM."""
        produtos = self.knowledge_base.get("produtos", [])
        produtos_txt = "\n".join([
            f"- {p['nome']} ({p['categoria']}): Preço {p['preco_formatado']} | Tamanhos: {', '.join(p['tamanhos'])} | Cores: {', '.join(p['cores'])} | Tecido: {p['tecido']} | Ocasião: {', '.join(p['ocasiao'])} | Descrição: {p['descricao']}"
            for p in produtos
        ])

        guia_medidas = self.knowledge_base.get("guia_medidas", {})
        medidas_txt = "\n".join([f"- {tam}: {desc}" for tam, desc in guia_medidas.items()])

        return f"""Você é Sofia, a consultora virtual de moda feminina oficial da loja "Amoda".
Seu objetivo é encantar as clientes, ajudando-as a escolher looks impecáveis, encontrar o tamanho ideal, combinar peças da loja e tirar dúvidas sobre compras.

DIRETRIZES DE ATENDIMENTO E PERSONALIDADE:
1. Tom de voz: Simpática, elegante, natural, profissional e objetiva. Use emojis delicados com moderação (✨, 👗, 💜, 🌸, 👠).
2. REGRA DE OURO (ZERO ALUCINAÇÃO):
   - NUNCA invente produtos, preços, tamanhos, cores ou descontos que não estejam na lista de produtos abaixo.
   - Só informe preços, tamanhos e cores EXATAMENTE como cadastrados.
   - Se a cliente perguntar sobre algo que a Amoda não vende, diga com elegância que no momento a loja não possui essa peça e sugira uma alternativa disponível.
3. DÚVIDAS SOBRE PEDIDOS:
   - Os pedidos de exemplo cadastrados são:
     * PED-1048: Fernanda Lima | Vestido Midi Floral Aurora (M) | R$ 289,90 | Status: Saiu para entrega hoje | Rastreio: BR892173009BR (Sedex)
     * PED-2099: Camila Souza | Blazer Paris Lavanda (P) + Calça Wide Leg (38) | R$ 649,80 | Status: Pedido faturado em separação | Rastreio: AM998231002BR
     * PED-3050: Mariana Ribeiro | Conjunto Linho Riviera (G) | R$ 349,90 | Status: Entregue com sucesso
   - Se a cliente informar outro número de pedido, oriente-a a verificar o código ou chamar o atendimento humano no WhatsApp.
4. POLÍTICAS DA LOJA:
   - Pagamento: Pix com 5% de desconto à vista, Cartão em até 6x sem juros.
   - Frete: Grátis acima de R$ 299 para todo o Brasil. Entrega expressa em até 24h em capitais.
   - Trocas e Devoluções: Primeira troca 100% grátis em até 30 dias. Devolução com estorno em até 7 dias.
   - Atendimento humano: WhatsApp (11) 98765-4321 | sac@amoda.com.br | Seg a Sáb 09h às 20h.

CATÁLOGO OFICIAL DE PRODUTOS AMODA:
{produtos_txt}

TABELA DE MEDIDAS OFICIAL:
{medidas_txt}

Responda sempre em Português do Brasil com formatação clara em Markdown."""

    def _call_groq_llm(self, user_message: str, session_id: str) -> Optional[str]:
        """Faz a chamada à API da Groq com histórico multi-turn."""
        if not self.groq_api_key:
            return None

        # Recupera histórico da sessão
        history = self.conversation_histories.get(session_id, [])

        messages = [{"role": "system", "content": self._build_system_prompt()}]

        # Adiciona até os últimos 6 turnos de conversa
        for turn in history[-6:]:
            messages.append(turn)

        messages.append({"role": "user", "content": user_message})

        payload = {
            "model": self.groq_model,
            "messages": messages,
            "temperature": 0.5,
            "max_tokens": 700,
            "top_p": 0.9
        }

        try:
            req = urllib.request.Request(
                self.groq_api_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={
                    "Authorization": f"Bearer {self.groq_api_key}",
                    "Content-Type": "application/json"
                },
                method="POST"
            )

            with urllib.request.urlopen(req, timeout=12) as response:
                if response.status == 200:
                    result = json.loads(response.read().decode("utf-8"))
                    reply = result["choices"][0]["message"]["content"].strip()

                    # Atualiza histórico da sessão
                    history.append({"role": "user", "content": user_message})
                    history.append({"role": "assistant", "content": reply})
                    self.conversation_histories[session_id] = history[-10:]

                    return reply
        except Exception as e:
            print(f"[ChatbotEngine] Falha ao consultar Groq LLM: {e}")

        return None

    # =========================================================================
    # 5. PIPELINE PRINCIPAL DE PROCESSAMENTO
    # =========================================================================

    def process_message(self, user_message: str, session_id: str = "default") -> Dict[str, Any]:
        """
        Processa a mensagem da cliente:
        1. Validação de pedido específico
        2. Saudação personalizada
        3. LLM Generativa com RAG estrito (se disponível)
        4. Motor de busca léxica e base de conhecimento da Amoda
        5. Fallback estruturado
        """
        self.metrics["total_messages"] += 1
        msg_clean = user_message.strip()
        message_id = str(uuid.uuid4())
        now_ts = datetime.now().timestamp()

        # 1. Checagem de Rastreamento de Pedido
        order = self._check_order_code(msg_clean)
        if order:
            self.metrics["resolved_by_order_tracker"] += 1
            return {
                "reply": self._format_order_response(order),
                "source": "pedido",
                "confidence": 1.0,
                "timestamp": now_ts,
                "suggested_actions": self.SUGESTOES_PADRAO,
                "message_id": message_id
            }

        # 2. Saudação
        if self._is_greeting(msg_clean) and len(msg_clean.split()) <= 4:
            self.metrics["greetings"] += 1
            greeting_reply = (
                "Olá! Seja muito bem-vinda à **Amoda**! 🌸✨\n\n"
                "Eu sou a **Sofia**, sua consultora virtual de moda. Estou aqui para te ajudar a "
                "encontrar o look perfeito, sugerir combinações incríveis, tirar dúvidas sobre tamanhos "
                "e acompanhar seus pedidos.\n\n"
                "Como posso te ajudar hoje?"
            )
            return {
                "reply": greeting_reply,
                "source": "saudacao",
                "confidence": 1.0,
                "timestamp": now_ts,
                "suggested_actions": self.SUGESTOES_PADRAO,
                "message_id": message_id
            }

        # 3. Tentativa via LLM Generativa (Groq API)
        llm_reply = self._call_groq_llm(msg_clean, session_id)
        if llm_reply:
            self.metrics["resolved_by_llm"] += 1
            return {
                "reply": llm_reply,
                "source": "llm",
                "confidence": 0.95,
                "timestamp": now_ts,
                "suggested_actions": self.SUGESTOES_PADRAO,
                "message_id": message_id
            }

        # 4. Busca Factual na Base de Conhecimento RAG Local
        kb_reply, confidence, topic_id = self._search_knowledge_base(msg_clean)
        if kb_reply and confidence >= 0.35:
            self.metrics["resolved_by_knowledge_base"] += 1
            return {
                "reply": kb_reply,
                "source": "base_conhecimento",
                "confidence": round(confidence, 3),
                "timestamp": now_ts,
                "suggested_actions": self.SUGESTOES_PADRAO,
                "message_id": message_id
            }

        # 5. Busca por Produtos Específicos
        matched_products = self._search_products(msg_clean)
        if matched_products:
            self.metrics["resolved_by_knowledge_base"] += 1
            cards = []
            for p in matched_products[:3]:
                cards.append(
                    f"👗 **{p['nome']}** — {p['preco_formatado']}\n"
                    f"* **Tamanhos:** {', '.join(p['tamanhos'])}\n"
                    f"* **Cores:** {', '.join(p['cores'])}\n"
                    f"* **Tecido:** {p['tecido']}\n"
                    f"* **Ideal para:** {', '.join(p['ocasiao'])}\n"
                    f"_{p['descricao']}_"
                )
            prod_reply = (
                f"### ✨ Encontrei peças perfeitas para você na **Amoda**:\n\n"
                + "\n\n---\n\n".join(cards) +
                "\n\nGostaria de ver como combinar alguma dessas peças ou tirar dúvidas sobre o tamanho?"
            )
            return {
                "reply": prod_reply,
                "source": "base_conhecimento",
                "confidence": 0.85,
                "timestamp": now_ts,
                "suggested_actions": self.SUGESTOES_PADRAO,
                "message_id": message_id
            }

        # 6. Fallback Elegante da Sofia
        self.metrics["fallback_messages"] += 1
        fallback_reply = (
            "Não encontrei uma informação exata sobre isso em nosso catálogo atual, "
            "mas estou pronta para te ajudar a escolher qualquer peça da **Amoda**! 💖\n\n"
            "Você pode:\n"
            "* 👗 **Ver nossos produtos** e novidades;\n"
            "* 📏 **Consultar a tabela de medidas** para encontrar seu tamanho ideal;\n"
            "* ✨ **Pedir sugestão de um look** para uma ocasião (casamento, trabalho, casual);\n"
            "* 📦 **Consultar o status de um pedido** digitando o código (ex: `PED-1048`);\n"
            "* 👩‍💼 **Falar com uma consultora humana** no WhatsApp [(11) 98765-4321](https://wa.me/5511987654321)."
        )
        return {
            "reply": fallback_reply,
            "source": "fallback",
            "confidence": 0.2,
            "timestamp": now_ts,
            "suggested_actions": self.SUGESTOES_PADRAO,
            "message_id": message_id
        }

    # =========================================================================
    # 6. GESTÃO DE FEEDBACK E MÉTRICAS
    # =========================================================================

    def register_feedback(self, message_id: str, is_positive: bool) -> bool:
        if not message_id:
            return False
        self.metrics["feedbacks"][message_id] = is_positive
        if is_positive:
            self.metrics["positive_feedback"] += 1
        else:
            self.metrics["negative_feedback"] += 1
        return True

    def clear_history(self, session_id: str) -> None:
        if session_id in self.conversation_histories:
            del self.conversation_histories[session_id]

    def get_metrics(self) -> Dict[str, Any]:
        return {
            "total_messages": self.metrics["total_messages"],
            "resolved_by_llm": self.metrics["resolved_by_llm"],
            "resolved_by_knowledge_base": self.metrics["resolved_by_knowledge_base"],
            "resolved_by_order_tracker": self.metrics["resolved_by_order_tracker"],
            "fallback_messages": self.metrics["fallback_messages"],
            "greetings": self.metrics["greetings"],
            "positive_feedback": self.metrics["positive_feedback"],
            "negative_feedback": self.metrics["negative_feedback"],
            "active_sessions": len(self.conversation_histories)
        }
