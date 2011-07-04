import org.apache.commons.io.FileUtils;
import org.filirom1.concoct.requireJs.RequireJsCompiler;
import org.junit.Assert;
import org.junit.Test;

import java.io.File;
import java.io.IOException;

/**
 * Test with external dependencies, because Surefire copy resources of the tested project into a real path, but not
 * the resources of the dependencies (require.js, env.js, ...).
 */
public class BigRequireJsProjectTest {

    @Test
    public void testCompileBigRequireJsProject() throws IOException {
        //fixture
        File jsToCompile = new File(getClass().getClassLoader().getResource("app.js").getFile());
        File compiled = new File(getClass().getClassLoader().getResource("compiled.js").getFile());

        //execute
        String result = null;
        try {
            result = new RequireJsCompiler().compile(jsToCompile);
        } catch (IOException e) {
            e.printStackTrace();
            Assert.fail();
        }

        //check
        Assert.assertEquals(result, FileUtils.readFileToString(compiled));
    }
}
