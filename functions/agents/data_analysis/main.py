from fastapi import FastAPI
from functions.agents.data_analysis.agent import DataAnalysisAgent
from functions.agents.data_analysis.schemas import TelematicsEvent

app = FastAPI()

agent = DataAnalysisAgent()

@app.post("/agents/data-analysis/run")
def run_data_analysis(event: TelematicsEvent):
    return agent.run(event)
