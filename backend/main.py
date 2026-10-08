"""
Servidor de API REST com FastAPI
Projeto: Amoda — Consultora Virtual de Moda Feminina com IA & Voz
Camada: Camada 3 — API REST & Comunicação Web
Arquivo: backend/main.py

Expõe o ChatbotEngine e catálogo de produtos/pedidos via rotas HTTP REST.
"""

import time
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import uvicorn

from chatbot_engine import ChatbotEngine

# =============================================================================
# 1. INICIALIZAÇÃO DA APLICAÇÃO E MOTOR DE IA
# =============================================================================

app = FastAPI(
    title="Amoda — Consultora Virtual API",
    description="API REST Full-Stack para Chatbot e Consultoria de Moda Feminina com IA Generativa, RAG e Voz.",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Inicializa o motor conversacional da Amoda
engine = ChatbotEngine()

# =============================================================================
# 2. CONFIGURAÇÃO DE CORS
# =============================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =============================================================================
# 3. MODELOS PYDANTIC (SCHEMAS)
# =============================================================================

class MessageRequest(BaseModel):
    """Modelo para recebimento de mensagens da cliente."""
    message: str = Field(
        ...,
        min_length=1,
        description="Texto da mensagem enviada pela cliente",
        example="Quais vestidos para casamento vocês têm disponíveis?"
    )
    session_id: Optional[str] = Field(
        default="default",
        description="Identificador único da sessão de conversa",
        example="amoda_session_12345"
    )


class FeedbackRequest(BaseModel):
    """Modelo para registro de avaliação (Like / Dislike) de uma resposta."""
    message_id: str = Field(
        ...,
        min_length=1,
        description="ID único da mensagem avaliada",
        example="550e8400-e29b-41d4-a716-446655440000"
    )
    is_positive: bool = Field(
        ...,
        description="True para Like (positivo) e False para Dislike (negativo)",
        example=True
    )


class ChatResponse(BaseModel):
    """Modelo de resposta estruturada do Chatbot."""
    reply: str = Field(
        ...,
        description="Texto de resposta gerado pela consultora de IA",
        example="A Amoda tem opções perfeitas para casamento..."
    )
    source: str = Field(
        ...,
        description="Origem da resposta ('llm', 'base_conhecimento', 'saudacao', 'pedido', 'fallback')",
        example="base_conhecimento"
    )
    confidence: float = Field(
        ...,
        description="Nível de confiança da resposta (0.0 a 1.0)",
        example=0.95
    )
    timestamp: float = Field(
        ...,
        description="Timestamp Unix no momento da geração da resposta",
        example=1726498540.123
    )
    suggested_actions: List[str] = Field(
        default_factory=list,
        description="Lista de botões de acesso rápido sugeridos",
        example=[
            "Ver produtos",
            "Novidades",
            "Encontrar meu tamanho",
            "Montar um look",
            "Dúvidas sobre pedidos"
        ]
    )
    message_id: Optional[str] = Field(
        default=None,
        description="Identificador único da mensagem para feedback",
        example="550e8400-e29b-41d4-a716-446655440000"
    )


class HealthResponse(BaseModel):
    """Modelo de resposta de verificação de saúde."""
    status: str
    empresa: str
    versao: str
    timestamp: float
    groq_llm_ativo: bool


# =============================================================================
# 4. ROTAS DA API REST
# =============================================================================

@app.get(
    "/",
    response_model=HealthResponse,
    summary="Verificação de Saúde (Health Check)",
    tags=["Monitoramento"]
)
def health_check() -> Dict[str, Any]:
    """Retorna o status operacional da API da Amoda."""
    return {
        "status": "online",
        "empresa": "Amoda Moda Feminina",
        "versao": "2.0.0",
        "timestamp": time.time(),
        "groq_llm_ativo": bool(engine.groq_api_key)
    }


@app.post(
    "/api/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Processa Mensagem Conversacional com a Consultora Virtual",
    tags=["Chat & Consultoria de IA"]
)
def process_chat_message(request: MessageRequest) -> Dict[str, Any]:
    """
    Recebe a mensagem da cliente e retorna a resposta da consultora virtual Sofia.
    Utiliza RAG (catálogo de produtos da Amoda), LLM Groq/Llama-3 e rastreamento de pedidos.
    """
    try:
        response_data = engine.process_message(
            user_message=request.message,
            session_id=request.session_id or "default"
        )
        return response_data
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro interno no processamento da mensagem: {str(exc)}"
        )


@app.get(
    "/api/products",
    summary="Lista Catálogo de Produtos da Loja",
    tags=["Catálogo de Produtos"]
)
def get_products(category: Optional[str] = None, only_new: Optional[bool] = False) -> Dict[str, Any]:
    """Retorna a lista completa de produtos cadastrados na Amoda com filtros opcionais."""
    products = engine.knowledge_base.get("produtos", [])
    if category and category.lower() != "todos":
        products = [p for p in products if p.get("categoria", "").lower() == category.lower()]
    if only_new:
        products = [p for p in products if p.get("novidade", False)]
    return {
        "total": len(products),
        "produtos": products
    }


@app.get(
    "/api/products/{product_id}",
    summary="Detalhes de um Produto",
    tags=["Catálogo de Produtos"]
)
def get_product_details(product_id: str) -> Dict[str, Any]:
    """Retorna os detalhes de um produto específico pelo ID."""
    products = engine.knowledge_base.get("produtos", [])
    product = next((p for p in products if p.get("id", "").upper() == product_id.upper()), None)
    if not product:
        raise HTTPException(status_code=404, detail="Produto não encontrado.")
    return product


@app.get(
    "/api/orders/{order_id}",
    summary="Consulta Status de Pedido",
    tags=["Pedidos & Rastreio"]
)
def get_order_status(order_id: str) -> Dict[str, Any]:
    """Consulta os detalhes e rastreamento de um pedido pelo código (ex: PED-1048)."""
    orders = engine.knowledge_base.get("pedidos_exemplo", {})
    clean_id = order_id.upper().strip()
    order = orders.get(clean_id)
    if not order:
        raise HTTPException(
            status_code=404,
            detail=f"Pedido '{order_id}' não encontrado no sistema. Verifique o código digitado."
        )
    return order


@app.post(
    "/api/feedback",
    status_code=status.HTTP_200_OK,
    summary="Registra Feedback da Mensagem",
    tags=["Métricas & Qualidade"]
)
def register_feedback(request: FeedbackRequest) -> Dict[str, Any]:
    """Registra a avaliação (Like / Dislike) de uma resposta da consultora."""
    success = engine.register_feedback(
        message_id=request.message_id,
        is_positive=request.is_positive
    )
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não foi possível registrar o feedback para este message_id."
        )
    return {
        "status": "success",
        "message": "Feedback registrado com sucesso.",
        "message_id": request.message_id,
        "is_positive": request.is_positive
    }


@app.delete(
    "/api/history/{session_id}",
    summary="Limpa Histórico de Sessão (Nova Conversa)",
    tags=["Chat & Consultoria de IA"]
)
def clear_history(session_id: str) -> Dict[str, Any]:
    """Reseta o histórico multi-turn de uma sessão de conversa."""
    engine.clear_history(session_id)
    return {
        "status": "success",
        "message": f"Histórico da sessão '{session_id}' foi resetado."
    }


@app.get(
    "/api/metrics",
    summary="Métricas Operacionais",
    tags=["Monitoramento"]
)
def get_metrics() -> Dict[str, Any]:
    """Retorna estatísticas de atendimento da consultora virtual."""
    return engine.get_metrics()


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
