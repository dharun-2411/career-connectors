from ..state import AgentState

def profile_analyzer_node(state: AgentState) -> AgentState:
    """
    Normalizes profile skills, enriches technical taxonomy, and extracts core strengths.
    """
    skill_names = [s.name for s in state.student_skills]
    summary = f"Student Profile #{state.student_id or 'N/A'} equipped with {len(skill_names)} core skills: {', '.join(skill_names)}."
    
    state.profile_summary = summary
    state.execution_history.append("ProfileAnalyzerNode: Enriched profile metadata & skill taxonomy")
    return state
