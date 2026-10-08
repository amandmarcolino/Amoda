"""
Testes Automatizados do Backend & AI Engine
Projeto: Amoda — Moda Feminina & Consultoria de Estilo com IA
Camada: Camada 2/3 — Validação & Qualidade de Software
Arquivo: backend/test_backend.py
"""

import sys
import os
import time

# Configura encoding UTF-8 no console Windows caso necessário
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Adiciona o diretório atual ao sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from chatbot_engine import ChatbotEngine


def format_box(title: str) -> str:
    line = "=" * 65
    return f"\n{line}\n  {title}\n{line}"


def run_tests():
    print(format_box("🧪 INICIANDO BATERIA DE TESTES DO BACKEND (AMODA CONSULTORIA)"))
    
    # 1. Inicialização do Engine
    print("\n[1/4] Inicializando ChatbotEngine...")
    try:
        engine = ChatbotEngine()
        print("  ✓ ChatbotEngine instanciado com sucesso!")
        print(f"  ✓ Empresa carregada: {engine.knowledge_base.get('empresa', 'N/A')}")
        print(f"  ✓ Produtos no catálogo: {len(engine.knowledge_base.get('produtos', []))}")
        print(f"  ✓ Tópicos de atendimento: {len(engine.knowledge_base.get('topicos', []))}")
        
        # Exibe status da LLM
        has_key = bool(engine.groq_api_key)
        key_masked = f"{engine.groq_api_key[:8]}...{engine.groq_api_key[-4:]}" if has_key else "Nenhuma"
        print(f"  ✓ Status da LLM (Groq): {'Configurada' if has_key else 'Modo RAG Local/Offline'}")
        print(f"  ✓ Modelo Groq: {engine.groq_model} (Chave: {key_masked})")
    except Exception as e:
        print(f"  ❌ FALHA ao inicializar ChatbotEngine: {e}")
        return False

    tests_passed = 0
    total_tests = 4

    # =========================================================================
    # TESTE 1: Saudação da Cliente
    # =========================================================================
    print(format_box("TESTE 1: Validação de Saudação"))
    msg_1 = "Olá, tudo bem?"
    print(f"👤 Cliente: \"{msg_1}\"")
    
    t0 = time.time()
    resp_1 = engine.process_message(msg_1, session_id="test_session_amoda")
    dt_1 = (time.time() - t0) * 1000

    reply_1 = resp_1.get("reply", "") or resp_1.get("response", "")
    source_1 = resp_1.get("source", "desconhecido")
    conf_1 = resp_1.get("confidence", 1.0)

    print(f"⏱️ Tempo de resposta: {dt_1:.1f}ms")
    print(f"🏷️ Origem identificada: {source_1}")
    print(f"🎯 Confiança: {conf_1 * 100:.0f}%")
    print(f"🤖 Resposta da Consultora Sofia:\n{reply_1}")

    if reply_1 and ("amoda" in reply_1.lower() or "sofia" in reply_1.lower() or "bem-vinda" in reply_1.lower()):
        print("\n  [OK] Teste 1 PASSOU - Saudação personalizada da Amoda validada!")
        tests_passed += 1
    else:
        print("\n  [FALHA] Teste 1 NÃO PASSOU - Resposta de saudação inválida.")

    # =========================================================================
    # TESTE 2: Consulta de Produtos (Vestidos / Roupas)
    # =========================================================================
    print(format_box("TESTE 2: Consulta de Produtos & Catálogo (Vestidos)"))
    msg_2 = "Quais vestidos vocês têm para casamento ou festa?"
    print(f"👤 Cliente: \"{msg_2}\"")

    t0 = time.time()
    resp_2 = engine.process_message(msg_2, session_id="test_session_amoda")
    dt_2 = (time.time() - t0) * 1000

    reply_2 = resp_2.get("reply", "") or resp_2.get("response", "")
    source_2 = resp_2.get("source", "desconhecido")
    conf_2 = resp_2.get("confidence", 0.0)

    print(f"⏱️ Tempo de resposta: {dt_2:.1f}ms")
    print(f"🏷️ Origem identificada: {source_2}")
    print(f"🎯 Confiança: {float(conf_2) * 100:.1f}%")
    print(f"🤖 Resposta da Consultora Sofia:\n{reply_2}")

    keywords_produtos = ["vestido", "aurora", "fluidity", "festa", "r$", "casamento", "amoda", "tamanho"]
    has_product_info = any(k in reply_2.lower() for k in keywords_produtos)

    if reply_2 and has_product_info:
        print("\n  [OK] Teste 2 PASSOU - Catálogo e recomendações validados!")
        tests_passed += 1
    else:
        print("\n  [FALHA] Teste 2 NÃO PASSOU - Informações de produtos não encontradas.")

    # =========================================================================
    # TESTE 3: Rastreamento de Pedido
    # =========================================================================
    print(format_box("TESTE 3: Rastreamento de Pedido (PED-1048)"))
    msg_3 = "Quero rastrear o pedido PED-1048"
    print(f"👤 Cliente: \"{msg_3}\"")

    t0 = time.time()
    resp_3 = engine.process_message(msg_3, session_id="test_session_amoda")
    dt_3 = (time.time() - t0) * 1000

    reply_3 = resp_3.get("reply", "") or resp_3.get("response", "")
    source_3 = resp_3.get("source", "desconhecido")
    conf_3 = resp_3.get("confidence", 0.0)

    print(f"⏱️ Tempo de resposta: {dt_3:.1f}ms")
    print(f"🏷️ Origem identificada: {source_3}")
    print(f"🎯 Confiança: {float(conf_3) * 100:.1f}%")
    print(f"🤖 Resposta da Consultora Sofia:\n{reply_3}")

    if reply_3 and ("ped-1048" in reply_3.lower() or "transporte" in reply_3.lower() or "rastreio" in reply_3.lower()):
        print("\n  [OK] Teste 3 PASSOU - Rastreamento de pedidos validado!")
        tests_passed += 1
    else:
        print("\n  [FALHA] Teste 3 NÃO PASSOU - Detalhes do pedido não encontrados.")

    # =========================================================================
    # TESTE 4: Dúvidas sobre Pagamento e Entrega
    # =========================================================================
    print(format_box("TESTE 4: Formas de Pagamento e Entrega"))
    msg_4 = "Quais são as formas de pagamento e prazos de entrega?"
    print(f"👤 Cliente: \"{msg_4}\"")

    t0 = time.time()
    resp_4 = engine.process_message(msg_4, session_id="test_session_amoda")
    dt_4 = (time.time() - t0) * 1000

    reply_4 = resp_4.get("reply", "") or resp_4.get("response", "")
    source_4 = resp_4.get("source", "desconhecido")
    conf_4 = resp_4.get("confidence", 0.0)

    print(f"⏱️ Tempo de resposta: {dt_4:.1f}ms")
    print(f"🏷️ Origem identificada: {source_4}")
    print(f"🎯 Confiança: {float(conf_4) * 100:.1f}%")
    print(f"🤖 Resposta da Consultora Sofia:\n{reply_4}")

    keywords_faq = ["pix", "cartão", "entrega", "sedex", "pac", "frete", "pagamento", "dias"]
    has_faq_info = any(k in reply_4.lower() for k in keywords_faq)

    if reply_4 and has_faq_info:
        print("\n  [OK] Teste 4 PASSOU - FAQ de pagamentos e fretes validado!")
        tests_passed += 1
    else:
        print("\n  [FALHA] Teste 4 NÃO PASSOU - FAQ não respondido corretamente.")

    # =========================================================================
    # TESTE BÔNUS: Validação de Feedback e Métricas
    # =========================================================================
    print(format_box("TESTE BÔNUS: Validação de Feedback & Métricas"))
    msg_id = resp_2.get("message_id")
    if msg_id:
        feedback_ok = engine.register_feedback(msg_id, is_positive=True)
        metrics = engine.get_metrics()
        print(f"  ✓ Feedback Like registrado para mensagem {msg_id[:8]}...: {'Sucesso' if feedback_ok else 'Falha'}")
        print(f"  ✓ Métricas atuais:")
        print(f"      - Total de mensagens: {metrics.get('total_messages')}")
        print(f"      - Resolvidas por Base/RAG: {metrics.get('resolved_by_knowledge_base')}")
        print(f"      - Resolvidas por LLM: {metrics.get('resolved_by_llm')}")
        print(f"      - Pedidos rastreados: {metrics.get('resolved_by_order_tracker')}")
        print(f"      - Saudações: {metrics.get('greetings')}")
        print(f"      - Feedback positivo: {metrics.get('positive_feedback')}")
    
    # =========================================================================
    # RESUMO FINAL
    # =========================================================================
    print(format_box("📊 RESUMO FINAL DOS TESTES"))
    print(f"  • Testes Executados: {total_tests}")
    print(f"  • Testes Aprovados:  {tests_passed}/{total_tests}")
    
    if tests_passed == total_tests:
        print("\n🎉 [OK] TODOS OS TESTES PASSARAM COM SUCESSO! A CONSULTORA DA AMODA ESTÁ OPERACIONAL.\n")
        return True
    else:
        print(f"\n⚠️ [FALHA] {total_tests - tests_passed} teste(s) falharam.\n")
        return False


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
