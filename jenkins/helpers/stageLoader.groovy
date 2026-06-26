// Jenkins Pipeline Stage Loader Helper
// This helper function dynamically loads stages from local files or GitLab

def loadStage(stageName, stageSource = 'gitlab', repoUrl = '' , folderJenkins , gitlabToken) {
    def stageUrl
    stageUrl = "${repoUrl}/stages/${stageName}.groovy"
    echo "🦊 Loading stage '${stageName}' from GitLab: ${stageUrl}"
    return loadStageFromUrl(stageName, stageUrl, 'GitLab',folderJenkins, gitlabToken)
}

def loadStageFromLocal(stageName, stagePath) {
    try {
        if (!fileExists(stagePath)) {
            error("❌ Local stage file not found: ${stagePath}")
        }
        return load(stagePath)
    } catch (Exception e) {
        error("❌ Failed to load local stage '${stageName}': ${e.getMessage()}")
    }
}


def loadStageFromUrl(String stageName, String stageUrl, String source,String folderJenkins, String gitlabToken ) {
    try {
      echo "🔧 Loading stage '${stageName}' from ${source}"

       String rawUrl = "https://gitlab.iquritech.com/api/v4/projects/devops%2Fjenkins/repository/files/${folderJenkins}%2F${stageName}.groovy/raw?ref=main"

      // Fetch file. -L follows redirects. Fail verbosely if HTTP error.
        def stageContent = sh(
        script: """
            curl -fsSL -H "PRIVATE-TOKEN: ${gitlabToken}" \
           "${rawUrl}"
        """,
        returnStdout: true
        ).trim()

      // Basic sanity checks (sometimes you get HTML login pages or 404 bodies)
      if (!stageContent || stageContent.size() == 0) {
        error("❌ Empty response downloading: ${rawUrl}")
      }

      String lc = stageContent.toLowerCase(Locale.ROOT)


      if (lc.contains('not found') || lc.contains('404') || lc.contains('<!doctype html')) {
        error("❌ Unexpected content (likely 404/HTML). URL: ${rawUrl}")
      }

      // Write to a temp file and validate it looks like a Jenkins shared step
      String tempFile = "temp_${stageName}_${env.BUILD_NUMBER}_${System.currentTimeMillis()}.groovy"
      writeFile file: tempFile, text: stageContent


      if (!stageContent.contains('def call(') && !stageContent.contains('return this')) {
        sh "rm -f ${tempFile}"
        error("❌ Invalid stage format (expected a callable step or return this): ${rawUrl}")
      }
      // Load and clean up
      def stage = load(tempFile)

      sh "rm -f ${tempFile}"

      echo "✅ Successfully loaded stage '${stageName}' from ${source}"
      return stage

    } catch (Exception e) {
      error("❌ Failed to load stage '${stageName}' from ${source}: ${e.getMessage()}")
    }
}


// Fallback method - try primary source, fall back to local if it fails
def loadStageWithFallback(stageName, primarySource, repoUrl = '') {
    try {
        return loadStage(stageName, primarySource, repoUrl)
    } catch (Exception e) {
        echo "⚠️ Failed to load stage '${stageName}' from ${primarySource}: ${e.getMessage()}"
        echo "🔄 Falling back to local stage..."
        return loadStage(stageName, 'local', '')
    }
}

return this
